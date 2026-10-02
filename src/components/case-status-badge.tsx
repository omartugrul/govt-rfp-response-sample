import { StatusBadge, type StatusTone } from "@/components/status-badge";
import type { CaseStatus } from "@/lib/case-state";

const TONES: Record<CaseStatus, StatusTone> = {
  "Not started": "neutral",
  "In review": "review",
  "Ready to sign": "progress",
  Signed: "done",
};

export function CaseStatusBadge({ status }: { status: CaseStatus }) {
  return <StatusBadge tone={TONES[status]}>{status}</StatusBadge>;
}
