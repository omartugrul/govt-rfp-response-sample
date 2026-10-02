"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, Lock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCase } from "@/components/case/case-context";
import { DEMO_TODAY } from "@/lib/cases";
import { assessmentDone, factsDone, type CaseState } from "@/lib/case-state";
import { SECTIONS, type SectionDef } from "@/lib/report";
import { cn } from "@/lib/utils";

const daysLeft = (due: string) => Math.round((Date.parse(due) - Date.parse(DEMO_TODAY)) / 86_400_000);

type StepState = "done" | "current" | "upcoming";

function StepMarker({ n, state }: { n: number; state: StepState }) {
  return (
    <span
      className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold tabular-nums",
        state === "done" && "border-approved bg-approved text-approved-foreground",
        state === "current" && "border-primary bg-primary text-primary-foreground",
        state === "upcoming" && "border-input bg-background text-muted-foreground",
      )}
    >
      {state === "done" ? <Check className="size-3.5" /> : n}
    </span>
  );
}

function ItemMarker({ approved, current }: { approved: boolean; current: boolean }) {
  if (approved) return <Check className="size-3.5 shrink-0 text-approved" aria-label="Approved" />;
  return (
    <span
      className={cn("size-2 shrink-0 rounded-full border", current ? "border-primary bg-primary" : "border-muted-foreground/50")}
      aria-hidden
    />
  );
}

function Step({
  n,
  label,
  detail,
  state,
  href,
  enabled,
  items,
}: {
  n: number;
  label: string;
  detail?: string;
  state: StepState;
  href: string;
  enabled: boolean;
  items?: { def: SectionDef; href: string; current: boolean; approved: boolean; onClick?: () => void }[];
}) {
  const head = (
    <>
      <StepMarker n={n} state={state} />
      <span className={cn("flex-1 text-sm", state === "current" ? "font-semibold" : state === "upcoming" && "text-muted-foreground")}>
        {label}
      </span>
      {detail && <span className="text-xs text-muted-foreground tabular-nums">{detail}</span>}
      {!enabled && <Lock className="size-3.5 text-muted-foreground" aria-label="Locked until earlier steps are done" />}
    </>
  );
  return (
    <li className="relative">
      {enabled ? (
        <Link href={href} className="flex items-center gap-3 rounded-md px-2 py-2 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
          {head}
        </Link>
      ) : (
        <div className="flex items-center gap-3 px-2 py-2" aria-disabled>
          {head}
        </div>
      )}
      {items && (
        <ol className="mt-0.5 mb-2 ml-[1.2rem] space-y-px border-l pl-3">
          {items.map((it) => (
            <li key={it.def.id}>
              <Link
                href={it.href}
                onClick={it.onClick}
                aria-current={it.current ? "step" : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
                  it.current ? "bg-accent font-medium text-accent-foreground hover:bg-accent" : "text-foreground/80",
                )}
              >
                <ItemMarker approved={it.approved} current={it.current} />
                <span className="truncate">{it.def.title}</span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </li>
  );
}

export function CaseOutline() {
  const { record, state } = useCase();
  const pathname = usePathname();
  const base = `/cases/${record.id}`;
  const [, , , step, sectionId] = pathname.split("/");
  const approved = (s: CaseState, id: string) => s.sections[id].status === "approved";

  const facts = SECTIONS.filter((d) => d.author === "ai");
  const officer = SECTIONS.filter((d) => d.author === "officer");
  const factsComplete = factsDone(state);
  const assessComplete = assessmentDone(state);
  const stepState = (done: boolean, current: boolean): StepState => (done ? "done" : current ? "current" : "upcoming");
  const days = daysLeft(record.dueDate);

  return (
    <aside className="flex h-full min-h-0 flex-col border-r bg-background">
      <div className="border-b px-5 py-4">
        <h1 className="text-lg font-semibold">{record.defendant}</h1>
        <p className="text-xs text-muted-foreground tabular-nums">Case {record.caseNumber}</p>
        <p className={cn("mt-1 text-xs tabular-nums", days <= 3 ? "font-medium text-review-foreground" : "text-muted-foreground")}>
          Report due {record.reportDue.replace(", 2026", "")} · {days === 1 ? "tomorrow" : `in ${days} days`}
        </p>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <nav aria-label="Report steps" className="px-3 py-4">
          <ol className="space-y-1">
            <Step
              n={1}
              label="Verify facts"
              detail={`${facts.filter((d) => approved(state, d.id)).length}/${facts.length}`}
              state={stepState(factsComplete, step === "verify")}
              href={`${base}/verify`}
              enabled
              items={facts.map((d) => ({
                def: d,
                href: `${base}/verify/${d.id}`,
                current: step === "verify" && sectionId === d.id,
                approved: approved(state, d.id),
              }))}
            />
            <Step
              n={2}
              label="Your assessment"
              detail={`${officer.filter((d) => approved(state, d.id)).length}/${officer.length}`}
              state={stepState(assessComplete, step === "assess")}
              href={`${base}/assess`}
              enabled
              items={officer.map((d) => ({
                def: d,
                href: `${base}/assess#section-${d.id}`,
                current: false,
                approved: approved(state, d.id),
                // Already on the page: scroll to the section ourselves, since it lives in a scroll container.
                onClick: () =>
                  step === "assess" && document.getElementById(`section-${d.id}`)?.scrollIntoView({ block: "start", behavior: "smooth" }),
              }))}
            />
            <Step
              n={3}
              label={state.signed ? "Signed and filed" : "Sign and file"}
              state={stepState(!!state.signed, step === "sign" || step === "done")}
              href={`${base}/${state.signed ? "done" : "sign"}`}
              enabled={factsComplete && assessComplete}
            />
          </ol>
        </nav>
      </ScrollArea>

    </aside>
  );
}
