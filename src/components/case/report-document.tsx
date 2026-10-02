"use client";

import { useCase } from "@/components/case/case-context";
import { suggestionText } from "@/components/case/fact-section";
import { OFFICER, OFFICER_TITLE } from "@/lib/cases";
import { SECTIONS } from "@/lib/report";

/** The report as the court will read it. */
export function ReportDocument() {
  const { record, draft, state } = useCase();
  return (
    <article className="rounded-lg bg-background px-14 py-14 shadow-[0_1px_3px_rgb(0_0_0/0.06),0_8px_24px_-8px_rgb(0_0_0/0.08)] ring-1 ring-border">
      <header className="border-b pb-8">
        <h2 className="font-serif text-3xl font-semibold">Pre-sentence report</h2>
        <p className="mt-2 font-serif text-lg">People v. {record.defendant}</p>
        <p className="mt-4 text-sm text-muted-foreground tabular-nums">
          Case {record.caseNumber} · Superior Court, Dept. 14 · Sentencing {record.sentencingDate} · Prepared by{" "}
          {OFFICER}
        </p>
      </header>
      <div className="space-y-8 pt-8">
        {SECTIONS.map((d) => (
          <section key={d.id}>
            <h3 className="font-serif text-lg font-semibold">{d.title}</h3>
            <p className="mt-2 font-serif text-[17px] leading-[1.75] whitespace-pre-wrap">
              {state.sections[d.id].text ?? suggestionText(draft.sections.find((s) => s.id === d.id))}
            </p>
          </section>
        ))}
      </div>
      {state.signed && (
        <footer className="mt-12 border-t pt-6">
          {/* eslint-disable-next-line @next/next/no-img-element -- a data URL drawn by the officer */}
          <img src={state.signed.signature} alt={`Signature of ${state.signed.name}`} className="h-20 w-auto" />
          <div className="mt-1 w-72 border-t pt-2 font-serif">
            <p>{state.signed.name}</p>
            <p className="text-sm text-muted-foreground">
              {OFFICER_TITLE} ·{" "}
              {new Date(state.signed.at).toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" })}
            </p>
          </div>
        </footer>
      )}
    </article>
  );
}
