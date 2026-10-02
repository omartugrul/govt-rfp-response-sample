import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// The RFP's requirements and guardrails, grouped by where each one comes from.
const REQUIREMENTS: { source: string; note: string; items: string[] }[] = [
  {
    source: "From the RFP",
    note: "AI Report Writing Services, County of San Diego Probation Department",
    items: [
      "An AI-enabled solution for report preparation: data extraction, summarization and drafting",
      "Reduce officers' manual workload",
      "Maintain County oversight, security and privacy requirements",
      "Preserve officer decision-making authority",
    ],
  },
  {
    source: "From the draft contract",
    note: "As reported when it was presented to vendors on September 8",
    items: [
      "AI may not make sentencing recommendations",
      "Use of AI is optional for officers",
      "Not used for reports on juvenile defendants (it may draw on adults' juvenile records)",
      "County data is for County use only, with no unauthorized sharing",
      "The vendor needs written approval to train AI on County data",
      "Annual bias and fairness assessments",
    ],
  },
  {
    source: "From the Board of Supervisors",
    note: "A supervisor's public conditions for the contract",
    items: ["Accuracy, equity and due process", "Testing for errors and bias", "Human oversight"],
  },
];

export default function IntroPage() {
  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="flex items-center gap-3 text-sm text-neutral-500">
          <Image src="/county-logo.png" alt="County of San Diego logo" width={36} height={33} />
          Prepared for County of San Diego Probation
        </div>

        <h1 className="mt-10 text-4xl font-semibold tracking-tight">Groundwork</h1>
        <p className="mt-3 text-lg text-balance text-neutral-600">
          A drafting assistant for pre-sentence reports. AI does the reading and restating; officers do the judging.
        </p>
        <div className="mt-8 flex items-center gap-4">
          <Link
            href="/cases"
            className={cn(buttonVariants({ size: "lg" }), "h-11 bg-neutral-900 px-5 text-base hover:bg-neutral-800")}
          >
            Enter the demo <ArrowRight />
          </Link>
          <span className="text-sm text-neutral-500">Fictional case data, about 3 minutes</span>
        </div>

        <Separator className="my-14" />

        <section>
          <h2 className="text-lg font-semibold">What the County asked for</h2>
          <blockquote className="mt-3 font-serif text-lg leading-relaxed text-neutral-700 italic">
            “An artificial intelligence‑enabled solution that streamlines … report preparation by reducing manual
            workload and supporting efficient data extraction, summarization, and drafting.”
          </blockquote>
          <p className="mt-3 text-sm text-neutral-500">
            AI Report Writing Services RFP. Proposals due October 16, 2026.
          </p>
          <p className="mt-6 text-sm leading-relaxed text-neutral-700">
            The tool supports the pre-sentence reports officers write for judges, about 7,800 a year. It works from
            police reports, court transcripts, case notes and criminal-history records.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-semibold">Requirements and guardrails</h2>
          <div className="mt-5 space-y-8">
            {REQUIREMENTS.map((group) => (
              <div key={group.source}>
                <h3 className="text-sm font-semibold">{group.source}</h3>
                <p className="text-xs text-neutral-500">{group.note}</p>
                <ul className="mt-3 divide-y divide-neutral-200 border-y border-neutral-200">
                  {group.items.map((item) => (
                    <li key={item} className="py-2.5 text-sm text-neutral-700">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-14 space-y-2 text-xs leading-relaxed text-neutral-500">
          <p>
            Demonstration only. People, cases and documents are fictional, County system connections are simulated,
            and the AI drafts were generated ahead of time with Claude, with every citation checked against its source.
            Not affiliated with or endorsed by the County of San Diego.
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
            </a>
            ,{" "}
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
