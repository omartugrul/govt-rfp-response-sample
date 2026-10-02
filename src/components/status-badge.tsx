import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusTone = "review" | "progress" | "done" | "neutral";

const TINT: Record<StatusTone, string> = {
  review: "border-review/50 bg-review/10 text-review-foreground",
  progress: "text-muted-foreground",
  done: "border-approved/40 bg-approved/10 text-approved",
  neutral: "text-muted-foreground",
};

const DOT: Record<StatusTone, string> = {
  review: "bg-review",
  progress: "bg-primary",
  done: "bg-approved",
  neutral: "bg-muted-foreground/50",
};

export function StatusBadge({ tone, children }: { tone: StatusTone; children: React.ReactNode }) {
  return (
    <Badge variant="outline" className={cn("gap-1.5 font-normal", TINT[tone])}>
      <span className={cn("size-2 rounded-full", DOT[tone])} aria-hidden />
      {children}
    </Badge>
  );
}

/** Unboxed variant for use inside an already-highlighted row. */
export function StatusText({ tone, children }: { tone: StatusTone; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "flex items-center gap-1.5 text-xs",
        tone === "done" ? "text-approved" : tone === "review" ? "text-review-foreground" : "text-muted-foreground",
      )}
    >
      <span className={cn("size-2 rounded-full", DOT[tone])} aria-hidden />
      {children}
    </span>
  );
}
