"use client";

import { useState } from "react";
import { ArrowRight, Info, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { StatusBadge, StatusText, type StatusTone } from "@/components/status-badge";
import { useCase } from "@/components/case/case-context";
import type { DraftSection } from "@/lib/cases";
import { OFFICER } from "@/lib/cases";
import type { SectionState } from "@/lib/case-state";
import type { SectionDef } from "@/lib/report";
import { cn } from "@/lib/utils";

export const suggestionText = (draft?: DraftSection) => draft?.segments.map((s) => s.text).join(" ") ?? "";

export const formatTime = (iso?: string) =>
  iso ? new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "";

/** Cumulative citation count before each segment, so numbering runs across the section. */
export const citeOffsets = (draft: DraftSection) =>
  draft.segments.map((_, i) => draft.segments.slice(0, i).reduce((sum, s) => sum + s.cites.length, 0));

function sectionStatus(def: SectionDef, state: SectionState): [StatusTone, string] {
  if (state.status === "approved") return ["done", def.author === "officer" ? "Final" : "Approved"];
  if (def.author === "officer") return ["neutral", "Not written"];
  if (state.status === "review") return ["review", "Needs review"];
  return ["progress", state.custom ? "Written by you" : "Edited"];
}

export function SectionStatus({ def, state, plain }: { def: SectionDef; state: SectionState; plain?: boolean }) {
  const [tone, label] = sectionStatus(def, state);
  return plain ? <StatusText tone={tone}>{label}</StatusText> : <StatusBadge tone={tone}>{label}</StatusBadge>;
}

function CiteRef({ n, active, onClick }: { n: number; active: boolean; onClick: (n: number) => void }) {
  return (
    <button
      type="button"
      onClick={() => onClick(n)}
      aria-label={`Show source ${n}`}
      aria-pressed={active}
      className={cn(
        "relative cursor-pointer rounded-sm px-0.5 font-sans font-semibold text-primary tabular-nums outline-none after:absolute after:-inset-x-1 after:-inset-y-2 hover:underline focus-visible:ring-2 focus-visible:ring-ring",
        active && "bg-primary text-primary-foreground hover:no-underline",
      )}
    >
      {n}
    </button>
  );
}

function SuggestedText({
  draft,
  activeCite,
  onCite,
}: {
  draft: DraftSection;
  activeCite: number | null;
  onCite: (n: number) => void;
}) {
  const offsets = citeOffsets(draft);
  return (
    <p className="font-serif text-[17px] leading-[1.75]">
      {draft.segments.map((segment, i) => {
        const first = offsets[i] + 1;
        const holdsActive = activeCite !== null && activeCite >= first && activeCite < first + segment.cites.length;
        return (
          <span key={i}>
            <span
              onClick={() => onCite(first)}
              title="Show the source for this statement"
              className={cn(
                "cursor-pointer rounded-sm decoration-primary/40 underline-offset-4 transition-colors hover:underline",
                holdsActive && "bg-cite hover:no-underline",
              )}
            >
              {segment.text}
            </span>
            <sup className="ml-0.5 text-[11px] leading-none">
              {segment.cites.map((_, j) => (
                <span key={j}>
                  {j > 0 && <span className="text-muted-foreground">,</span>}
                  <CiteRef n={first + j} active={activeCite === first + j} onClick={onCite} />
                </span>
              ))}
            </sup>{" "}
          </span>
        );
      })}
    </p>
  );
}

export function FactSection({
  def,
  activeCite,
  onCite,
  onApproved,
}: {
  def: SectionDef;
  activeCite: number | null;
  onCite: (n: number) => void;
  onApproved: () => void;
}) {
  const { draft, state: caseState, saveText, restoreSuggestion, approve, reopen } = useCase();
  const state = caseState.sections[def.id];
  const sectionDraft = draft.sections.find((s) => s.id === def.id);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const [verified, setVerified] = useState(false);
  const [local, setLocal] = useState(state.text ?? "");

  const approved = state.status === "approved";
  const showingSuggestion = state.text === null;
  const currentText = state.text ?? suggestionText(sectionDraft);
  const freeform = state.custom && !approved;
  const locked = !!caseState.signed;
  const canApprove = freeform ? local.trim().length > 0 : verified && currentText.trim().length > 0;

  const doApprove = () => {
    if (freeform && local !== currentText) saveText(def.id, local);
    approve(def.id);
    setVerified(false);
    onApproved();
  };

  // EU-style taxonomy: untouched AI text is "AI-generated"; officer-edited AI text is "AI-assisted".
  const provenance = state.custom ? null : showingSuggestion ? "AI draft" : "AI-assisted";

  return (
    <article className="mx-auto max-w-[68ch]">
      <header className="flex items-baseline justify-between gap-6 border-b pb-3">
        <h2 className="font-serif text-xl font-semibold tracking-wide [font-variant-caps:all-small-caps]">{def.title}</h2>
        <div className="flex shrink-0 items-center gap-3">
          {provenance && <AiLabel kind={provenance} citations={sectionDraft?.segments.flatMap((x) => x.cites).length ?? 0} />}
          {!locked && !approved && !editing && !freeform && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Edit text"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setValue(currentText);
                      setEditing(true);
                    }}
                  />
                }
              >
                <Pencil />
              </TooltipTrigger>
              <TooltipContent>Edit text</TooltipContent>
            </Tooltip>
          )}
          <SectionStatus def={def} state={state} />
        </div>
      </header>

      <div className="mt-6">
        {editing || freeform ? (
          <div className="space-y-3">
            <Textarea
              autoFocus
              value={editing ? value : local}
              onChange={(e) => (editing ? setValue(e.target.value) : setLocal(e.target.value))}
              onKeyDown={(e) => editing && e.key === "Escape" && setEditing(false)}
              onBlur={editing || local === currentText ? undefined : () => saveText(def.id, local)}
              placeholder="Write this section in your own words…"
              aria-label={`${def.title} text`}
              className="min-h-56 font-serif text-[17px] leading-[1.75]"
            />
            {editing && (
              <div className="flex items-center gap-2">
                {value && (
                  <Button variant="ghost" className="mr-auto text-muted-foreground" onClick={() => setValue("")}>
                    Clear and start from scratch
                  </Button>
                )}
                <Button variant="ghost" className="ml-auto" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    saveText(def.id, value);
                    setEditing(false);
                    setVerified(false);
                  }}
                >
                  Save changes
                </Button>
              </div>
            )}
          </div>
        ) : showingSuggestion && sectionDraft ? (
          <SuggestedText draft={sectionDraft} activeCite={activeCite} onCite={onCite} />
        ) : (
          <p className="font-serif text-[17px] leading-[1.75] whitespace-pre-wrap">{currentText}</p>
        )}
      </div>

      {approved ? (
        <div className="mt-8 flex items-center justify-between gap-4 border-t pt-4 text-sm text-muted-foreground">
          <span>
            Approved by {OFFICER} on {formatTime(state.approvedAt)}
          </span>
          {!locked && (
            <Button variant="outline" size="sm" onClick={() => reopen(def.id)}>
              Reopen to change
            </Button>
          )}
        </div>
      ) : (
        !locked &&
        !editing && (
          <>
            {/* Per-output AI disclosure: quiet, directly under the generated text. */}
            <p className="mt-4 flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
              <Info className="mt-0.5 size-3.5 shrink-0" />
              <span>
                {freeform
                  ? "Written by you. The AI draft is set aside. "
                  : showingSuggestion
                    ? "AI-generated draft. It may contain errors. Check every statement against its numbered source before approving. "
                    : "AI-assisted draft, edited by you. Check every statement against its numbered source before approving. "}
                {!showingSuggestion && (
                  <Button variant="link" className="h-auto p-0 text-xs" onClick={() => restoreSuggestion(def.id)}>
                    {freeform ? "Use the AI draft instead" : "Restore the original AI draft"}
                  </Button>
                )}
              </span>
            </p>
            <div className="mt-8 flex items-center justify-between gap-6 border-t pt-5">
              {!freeform ? (
                <div className="flex items-center gap-3">
                  <Checkbox id={`verify-${def.id}`} checked={verified} onCheckedChange={(v) => setVerified(v === true)} />
                  <Label htmlFor={`verify-${def.id}`} className="text-sm font-normal">
                    I&apos;ve checked every statement against its source
                  </Label>
                </div>
              ) : (
                <span />
              )}
              <Button disabled={!canApprove} onClick={doApprove} className="shrink-0">
                Approve and continue <ArrowRight />
              </Button>
            </div>
          </>
        )
      )}
    </article>
  );
}

/** Text-only AI label (after IBM Carbon's AI label): clicking it explains how the draft was produced. */
function AiLabel({ kind, citations }: { kind: "AI draft" | "AI-assisted"; citations: number }) {
  return (
    <Popover>
      <PopoverTrigger className="cursor-pointer rounded-sm text-xs font-medium text-muted-foreground underline decoration-dotted underline-offset-4 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
        {kind}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 gap-3 p-4">
        <PopoverHeader>
          <PopoverTitle>How this draft was made</PopoverTitle>
        </PopoverHeader>
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          <li>Drafted by AI (Claude) from the 4 case documents attached to this case.</li>
          <li>Every statement cites the passage it relies on; all {citations} citations were checked word for word against the source text.</li>
          <li>The AI does not draft evaluations or sentencing recommendations.</li>
          {kind === "AI-assisted" && <li>You have edited this text since it was drafted.</li>}
        </ul>
        <p className="border-t pt-3 text-sm font-medium">AI can make mistakes. You are responsible for verifying it before approving.</p>
      </PopoverContent>
    </Popover>
  );
}
