import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const RFP_FACTS = [
  ["Buyer", "County of San Diego, Probation Department"],
  ["Solicitation", "Artificial Intelligence (AI) Report Writing Services"],
  ["Posted", "September 1, 2026"],
  ["Proposals due", "October 16, 2026"],
];

const CONSTRAINTS = [
  "AI may not make sentencing recommendations",
  "Use is optional for officers",
  "Not used for reports on juvenile defendants",
  "County data stays with the County; no vendor training without written approval",
  "Annual bias and fairness assessments",
];

const SHOWS = [
  "An officer's caseload, with case documents already attached from County systems",
  "AI-suggested factual sections, each statement linked to the exact passage it came from",
  "A review flow the officer can't skip: verify, edit, approve each section, then sign",
  "Officer-only evaluation and recommendation, and a hard stop on juvenile cases",
];

const SIMULATED = [
  "All people, cases, and documents are fictional",
  "Connections to County systems are simulated",
  "AI drafts were generated ahead of time with Claude; every citation is machine-checked against the source text",
  "Progress is saved only in your browser",
];

export default function IntroPage() {
  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="flex items-start justify-between gap-8">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">Groundwork</h1>
            <p className="mt-3 max-w-[52ch] text-lg text-balance text-neutral-600">
              A drafting assistant for pre-sentence reports. AI does the reading and restating; officers do
              the judging.
            </p>
            <p className="mt-2 text-sm text-neutral-500">
              A working demonstration, prepared in response to the County&apos;s AI Report Writing Services RFP.
            </p>
            <Link
              href="/cases"
              className={cn(buttonVariants({ size: "lg" }), "mt-8 h-11 bg-neutral-900 px-5 text-base hover:bg-neutral-800")}
            >
              Enter demo <ArrowRight />
            </Link>
          </div>
          <div className="flex shrink-0 flex-col items-center gap-2 text-center">
            <Image src="/county-logo.png" alt="County of San Diego logo" width={88} height={80} />
            <span className="text-xs leading-snug text-neutral-500">
              Prepared for
              <br />
              County of San Diego Probation
            </span>
          </div>
        </div>

        <Separator className="my-10" />

        <section>
          <h2 className="text-lg font-semibold text-neutral-900">What the County asked for</h2>
          <blockquote className="mt-3 max-w-[68ch] font-serif text-lg leading-relaxed text-neutral-700 italic">
            “Design, deliver, and maintain an artificial intelligence‑enabled solution that streamlines the County
            of San Diego (County) Probation Department (Probation) report preparation by reducing manual workload
            and supporting efficient data extraction, summarization, and drafting.”
          </blockquote>
          <Table className="mt-6">
            <TableBody>
              {RFP_FACTS.map(([label, value]) => (
                <TableRow key={label} className="hover:bg-transparent">
                  <TableCell className="w-40 pl-0 text-neutral-500">{label}</TableCell>
                  <TableCell className="whitespace-normal">{value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <h3 className="mt-8 text-sm font-semibold">Constraints in the draft contract, as reported</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-neutral-700">
            {CONSTRAINTS.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </section>

        <div className="mt-10 grid gap-10 sm:grid-cols-2">
          <section>
            <h2 className="text-lg font-semibold text-neutral-900">What this demo shows</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-neutral-700">
              {SHOWS.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-neutral-900">What&apos;s simulated</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-neutral-700">
              {SIMULATED.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </section>
        </div>

        <div className="mt-12">
          <Link
            href="/cases"
            className={cn(buttonVariants({ size: "lg" }), "h-11 bg-neutral-900 px-5 text-base hover:bg-neutral-800")}
          >
            Enter demo <ArrowRight />
          </Link>
        </div>

        <Separator className="my-12" />

        <footer className="space-y-2 text-xs text-neutral-500">
          <p>
            Demonstration only. Fictional data. Not a County system and not affiliated with or endorsed by the
            County of San Diego.
          </p>
          <p>
            Sources:{" "}
            <a
              className="underline underline-offset-2"
              href="https://starbridge.ai/rfp/rfp-artificial-intelligence-ai-report-writing-services"
              target="_blank"
              rel="noreferrer"
            >
              RFP listing
            </a>{" "}
            ·{" "}
            <a
              className="underline underline-offset-2"
              href="https://hoodline.com/2026/09/san-diego-county-eyes-ai-to-draft-reports-that-decide-who-goes-to-prison/"
              target="_blank"
              rel="noreferrer"
            >
              Coverage of the draft contract
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
