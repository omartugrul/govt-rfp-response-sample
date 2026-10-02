"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { getCase, OFFICER } from "@/lib/cases";
import { SECTIONS } from "@/lib/report";

export type SectionStatus = "review" | "edited" | "approved" | "empty";

export type SectionState = {
  status: SectionStatus;
  /** Officer's text. null means the AI suggestion is shown unchanged. */
  text: string | null;
  /** True when the officer discarded the AI suggestion and wrote the section themselves. */
  custom: boolean;
  approvedAt?: string;
};

export type HistoryEvent = {
  at: string;
  actor: "AI" | "Officer";
  action: string;
  detail?: string;
};

/** How the officer chose to prepare the factual sections. "unset" until they choose. */
export type DraftMode = "unset" | "ai" | "manual";

export type CaseState = {
  mode: DraftMode;
  sections: Record<string, SectionState>;
  history: HistoryEvent[];
  /** signature is a PNG data URL of the officer's drawn signature. */
  signed?: { name: string; at: string; signature: string };
};

export type CaseStatus = "Not started" | "In review" | "Ready to sign" | "Signed";

// Bump the version when CaseState's shape changes so old saved progress starts fresh instead of breaking.
const storageKey = (caseId: string) => `groundwork:v3:case:${caseId}`;

function initialState(caseId: string): CaseState {
  const record = getCase(caseId);
  const sections: Record<string, SectionState> = {};
  for (const def of SECTIONS) {
    sections[def.id] =
      def.author === "ai"
        ? { status: "review", text: null, custom: false }
        : { status: "empty", text: "", custom: true };
  }
  return { mode: record?.draft ? "unset" : "manual", sections, history: [] };
}

const FACT_IDS = SECTIONS.filter((d) => d.author === "ai").map((d) => d.id);

/**
 * Switch drafting mode without losing work: only untouched, unapproved sections change.
 * Off: AI drafts become empty editors. On: empty officer sections get their AI draft back.
 */
function withMode(s: CaseState, mode: "ai" | "manual"): Record<string, SectionState> {
  const sections = { ...s.sections };
  for (const id of FACT_IDS) {
    const sec = sections[id];
    if (sec.status === "approved") continue;
    if (mode === "manual" && sec.text === null) sections[id] = { status: "empty", text: "", custom: true };
    if (mode === "ai" && sec.custom && !sec.text?.trim()) sections[id] = { status: "review", text: null, custom: false };
  }
  return sections;
}

function load(caseId: string): CaseState {
  try {
    const raw = localStorage.getItem(storageKey(caseId));
    if (raw) return JSON.parse(raw) as CaseState;
  } catch {
    // Storage unavailable or corrupt: fall back to a fresh case.
  }
  return initialState(caseId);
}

function save(caseId: string, state: CaseState) {
  try {
    localStorage.setItem(storageKey(caseId), JSON.stringify(state));
  } catch {
    // Non-fatal: progress just won't survive a refresh.
  }
}

export function caseStatus(state: CaseState): CaseStatus {
  if (state.signed) return "Signed";
  const all = Object.values(state.sections);
  if (all.every((s) => s.status === "approved")) return "Ready to sign";
  if (state.mode !== "unset" || state.history.some((e) => e.actor === "Officer")) return "In review";
  return "Not started";
}

const noopSubscribe = () => () => {};

/** False during server render and hydration, true afterwards. Gate anything read from localStorage on it. */
export function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

export function useCaseState(caseId: string) {
  const [state, setState] = useState<CaseState>(() =>
    typeof window === "undefined" ? initialState(caseId) : load(caseId),
  );
  const ready = useHydrated();

  const update = useCallback(
    (fn: (s: CaseState) => CaseState) =>
      setState((prev) => {
        const next = fn(prev);
        save(caseId, next);
        return next;
      }),
    [caseId],
  );

  const log = (s: CaseState, action: string, detail?: string): HistoryEvent[] => [
    ...s.history,
    { at: new Date().toISOString(), actor: "Officer", action, detail },
  ];

  const titleOf = (id: string) => SECTIONS.find((d) => d.id === id)?.title ?? id;

  return {
    state,
    ready,
    /** First choice when opening the case, or a later change from the outline. */
    setMode: (mode: "ai" | "manual") =>
      update((s) => {
        const first = s.mode === "unset";
        const draft = getCase(caseId)?.draft;
        const events: HistoryEvent[] = [...s.history];
        if (mode === "ai" && draft && !s.history.some((e) => e.actor === "AI")) {
          events.push({
            at: new Date().toISOString(),
            actor: "AI",
            action: "Draft suggestions generated",
            detail: `${draft.sections.length} factual sections from 4 documents, ${draft.citationCount} citations checked against source text`,
          });
        }
        events.push({
          at: new Date().toISOString(),
          actor: "Officer",
          action: first
            ? mode === "ai"
              ? "Chose to start from AI drafts"
              : "Chose to write without AI"
            : mode === "ai"
              ? "Turned AI drafting on"
              : "Turned AI drafting off",
        });
        return { ...s, mode, sections: withMode(s, mode), history: events };
      }),
    saveText: (id: string, text: string) =>
      update((s) => ({
        ...s,
        sections: {
          ...s.sections,
          [id]: { ...s.sections[id], text, status: text.trim() ? "edited" : s.sections[id].custom ? "empty" : "edited" },
        },
        history: log(s, `Edited “${titleOf(id)}”`, `${OFFICER} saved changes`),
      })),
    writeOwn: (id: string) =>
      update((s) => ({
        ...s,
        sections: { ...s.sections, [id]: { status: "empty", text: "", custom: true } },
        history: log(s, `Discarded AI suggestion for “${titleOf(id)}”`, "Officer chose to write this section"),
      })),
    restoreSuggestion: (id: string) =>
      update((s) => ({
        ...s,
        sections: { ...s.sections, [id]: { status: "review", text: null, custom: false } },
        history: log(s, `Restored AI suggestion for “${titleOf(id)}”`),
      })),
    approve: (id: string) =>
      update((s) => ({
        ...s,
        sections: {
          ...s.sections,
          [id]: { ...s.sections[id], status: "approved", approvedAt: new Date().toISOString() },
        },
        history: log(s, `Approved “${titleOf(id)}”`, "Verified against source documents"),
      })),
    reopen: (id: string) =>
      update((s) => {
        const section = s.sections[id];
        const status: SectionStatus = section.text === null ? "review" : section.text.trim() ? "edited" : "empty";
        return {
          ...s,
          sections: { ...s.sections, [id]: { ...section, status, approvedAt: undefined } },
          history: log(s, `Reopened “${titleOf(id)}”`),
        };
      }),
    sign: (name: string, signature: string) =>
      update((s) => {
        const at = new Date().toISOString();
        return { ...s, signed: { name, at, signature }, history: log(s, "Signed and filed report", `Signed by ${name}`) };
      }),
    reset: () => {
      const fresh = initialState(caseId);
      save(caseId, fresh);
      setState(fresh);
    },
  };
}

export function readCaseStatus(caseId: string): CaseStatus {
  return caseStatus(load(caseId));
}

export type Step = "start" | "verify" | "assess" | "sign" | "done";

export const factsDone = (state: CaseState) =>
  SECTIONS.filter((d) => d.author === "ai").every((d) => state.sections[d.id].status === "approved");

export const assessmentDone = (state: CaseState) =>
  SECTIONS.filter((d) => d.author === "officer").every((d) => state.sections[d.id].status === "approved");

/** The step an officer should land on when opening the case. */
export function currentStep(state: CaseState): Step {
  if (state.signed) return "done";
  if (state.mode === "unset") return "start";
  if (!factsDone(state)) return "verify";
  if (!assessmentDone(state)) return "assess";
  return "sign";
}

/** Wipe a case's saved progress (used by the demo's floating Reset control). */
export function clearCase(caseId: string) {
  try {
    localStorage.removeItem(storageKey(caseId));
  } catch {
    // Nothing saved, or storage unavailable.
  }
}
