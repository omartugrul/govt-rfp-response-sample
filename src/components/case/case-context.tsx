"use client";

import { createContext, useContext } from "react";
import { getCase, type CaseDraft, type CaseRecord } from "@/lib/cases";
import { useCaseState } from "@/lib/case-state";

type CaseContextValue = ReturnType<typeof useCaseState> & { record: CaseRecord; draft: CaseDraft };

const CaseContext = createContext<CaseContextValue | null>(null);

export function CaseProvider({ caseId, children }: { caseId: string; children: React.ReactNode }) {
  const caseState = useCaseState(caseId);
  const record = getCase(caseId)!;
  // State lives in localStorage, so render only after hydration to avoid a mismatch.
  if (!caseState.ready) return null;
  return <CaseContext.Provider value={{ ...caseState, record, draft: record.draft! }}>{children}</CaseContext.Provider>;
}

export function useCase() {
  const value = useContext(CaseContext);
  if (!value) throw new Error("useCase must be used inside CaseProvider");
  return value;
}
