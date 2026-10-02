"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Lock } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useCase } from "@/components/case/case-context";
import { SectionStatus, formatTime, suggestionText } from "@/components/case/fact-section";
import { OFFICER } from "@/lib/cases";
import { assessmentDone, factsDone } from "@/lib/case-state";
import { SECTIONS, type SectionDef } from "@/lib/report";
import { cn } from "@/lib/utils";

function OfficerSection({ def }: { def: SectionDef }) {
  const { state: caseState, saveText, approve, reopen } = useCase();
  const state = caseState.sections[def.id];
  const [local, setLocal] = useState(state.text ?? "");
  const approved = state.status === "approved";
  const locked = !!caseState.signed;

  const commit = () => {
    if (local !== (state.text ?? "")) saveText(def.id, local);
  };

  return (
    <section id={`section-${def.id}`} className="scroll-mt-6">
      <div className="flex items-start justify-between gap-6 border-b pb-3">
        <div>
          <Label htmlFor={def.id} className="font-serif text-xl font-semibold tracking-wide [font-variant-caps:all-small-caps]">
            {def.title}
          </Label>
          <p className="mt-1 text-sm text-muted-foreground">
            {approved ? `Marked final by ${OFFICER} on ${formatTime(state.approvedAt)}` : def.hint}
          </p>
        </div>
        <SectionStatus def={def} state={state} />
      </div>
      {approved ? (
        <p className="mt-4 font-serif text-[17px] leading-[1.75] whitespace-pre-wrap">{state.text}</p>
      ) : (
        <Textarea
          id={def.id}
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          onBlur={commit}
          className="mt-4 min-h-44 font-serif text-[17px] leading-[1.75]"
        />
      )}
      {!locked && (
        <div className="mt-3 flex justify-end">
          {approved ? (
            <Button variant="outline" onClick={() => reopen(def.id)}>
              Reopen to change
            </Button>
          ) : (
            <Button
              disabled={!local.trim()}
              onClick={() => {
                commit();
                approve(def.id);
              }}
            >
              Mark as final
            </Button>
          )}
        </div>
      )}
    </section>
  );
}

export default function AssessPage() {
  const { record, draft, state } = useCase();
  const facts = SECTIONS.filter((d) => d.author === "ai");
  const ready = factsDone(state) && assessmentDone(state);

  return (
    <div className="grid h-full grid-cols-[minmax(0,1fr)_26rem] grid-rows-[minmax(0,1fr)] overflow-hidden">
      <ScrollArea className="h-full min-h-0 bg-background">
        <div className="mx-auto max-w-[68ch] px-12 py-12">
          <h2 className="text-2xl font-semibold">Your assessment</h2>
          <p className="mt-2 flex items-start gap-2 text-muted-foreground">
            <Lock className="mt-1 size-4 shrink-0" />
            These sections are yours alone. Per County policy, AI does not draft evaluations or sentencing
            recommendations.
          </p>
          <div className="mt-10 space-y-12">
            {SECTIONS.filter((d) => d.author === "officer").map((d) => (
              <OfficerSection key={d.id} def={d} />
            ))}
          </div>
          <div className="mt-12 flex items-center justify-between border-t pt-6">
            <p className="text-sm text-muted-foreground">
              {ready
                ? "Everything is ready for your signature."
                : !factsDone(state)
                  ? "Some factual sections still need your approval."
                  : "Mark both sections final to continue."}
            </p>
            {ready ? (
              <Link href={`/cases/${record.id}/sign`} className={buttonVariants()}>
                Continue to sign <ArrowRight />
              </Link>
            ) : (
              !factsDone(state) && (
                <Link href={`/cases/${record.id}/verify`} className={buttonVariants({ variant: "outline" })}>
                  Back to verify facts
                </Link>
              )
            )}
          </div>
        </div>
      </ScrollArea>

      <aside className="flex min-h-0 flex-col border-l bg-muted/30">
        <div className="border-b px-5 py-4">
          <h2 className="text-sm font-semibold">Verified facts</h2>
          <p className="text-xs text-muted-foreground">For reference while you write.</p>
        </div>
        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-6 px-5 py-5">
            {facts.map((d) => {
              const s = state.sections[d.id];
              return (
                <section key={d.id}>
                  <h3 className={cn("text-sm font-semibold", s.status !== "approved" && "text-muted-foreground")}>
                    {d.title}
                    {s.status !== "approved" && <span className="font-normal"> (not yet approved)</span>}
                  </h3>
                  <p className="mt-1 font-serif text-[15px] leading-relaxed text-foreground/90">
                    {s.text ?? suggestionText(draft.sections.find((x) => x.id === d.id))}
                  </p>
                </section>
              );
            })}
          </div>
        </ScrollArea>
      </aside>
    </div>
  );
}
