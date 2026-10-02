"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useCase } from "@/components/case/case-context";
import { formatTime } from "@/components/case/fact-section";
import { OFFICER, OFFICER_TITLE } from "@/lib/cases";
import { currentStep } from "@/lib/case-state";
import { SECTIONS } from "@/lib/report";

export default function DonePage() {
  const { record, draft, state } = useCase();
  const router = useRouter();

  useEffect(() => {
    if (!state.signed) router.replace(`/cases/${record.id}/${currentStep(state)}`);
  }, [state, record.id, router]);
  if (!state.signed) return null;

  const facts = SECTIONS.filter((d) => d.author === "ai");
  const edited = facts.filter((d) => state.sections[d.id].text !== null).length;
  const signedAt = new Date(state.signed.at).toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" });

  const summary: [string, string][] = [
    ["Signed by", `${state.signed.name}, ${OFFICER_TITLE}`],
    ["Signed", signedAt],
    ["Filed with", `Superior Court, Dept. 14 · sentencing ${record.sentencingDate}`],
    [
      "Factual sections",
      `${facts.length} verified against ${draft.citationCount} cited passages${edited ? ` · ${edited} edited or rewritten by you` : ""}`,
    ],
    ["Evaluation & recommendation", "Written by you"],
  ];

  return (
    <ScrollArea className="h-full">
      <div className="mx-auto max-w-[44rem] px-8 py-16">
        <CheckCircle2 className="size-10 text-approved" />
        <h2 className="mt-5 text-3xl font-semibold text-balance">Report signed and filed</h2>
        <p className="mt-3 text-lg text-muted-foreground">
          The pre-sentence report for People v. {record.defendant} is with the court ahead of sentencing on{" "}
          {record.sentencingDate}. Filing is simulated in this demo.
        </p>

        {/* eslint-disable-next-line @next/next/no-img-element -- a data URL drawn by the officer */}
        <img
          src={state.signed.signature}
          alt={`Signature of ${state.signed.name}`}
          className="mt-8 h-16 w-auto rounded-md border bg-background px-3"
        />

        <dl className="mt-8 divide-y border-y">
          {summary.map(([label, value]) => (
            <div key={label} className="grid grid-cols-[13rem_1fr] gap-4 py-3 text-sm">
              <dt className="text-muted-foreground">{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-8 flex gap-3">
          <Link href="/cases" className={buttonVariants({ size: "lg" })}>
            Back to caseload
          </Link>
          <Link href={`/cases/${record.id}/sign`} className={buttonVariants({ size: "lg", variant: "outline" })}>
            View signed report
          </Link>
        </div>

        <Separator className="my-14" />

        <h3 className="text-lg font-semibold">Activity</h3>
        <p className="mt-1 text-sm text-muted-foreground">Every AI draft and officer action on this report.</p>
        <ol className="mt-5 divide-y">
          {[...state.history].reverse().map((e, i) => (
            <li key={i} className="grid grid-cols-[9rem_1fr] gap-4 py-3 text-sm">
              <span className="text-muted-foreground tabular-nums">{formatTime(e.at)}</span>
              <span>
                <span className="font-medium">{e.action}</span>
                <span className="text-muted-foreground"> · {e.actor === "AI" ? "AI" : OFFICER}</span>
                {e.detail && <span className="block text-muted-foreground">{e.detail}</span>}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </ScrollArea>
  );
}
