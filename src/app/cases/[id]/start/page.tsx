"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCase } from "@/components/case/case-context";

/** The officer decides, per case, whether to start from AI drafts. Use of AI is optional. */
export default function StartPage() {
  const { record, state, setMode } = useCase();
  const router = useRouter();

  const choose = (mode: "ai" | "manual") => {
    setMode(mode);
    router.push(`/cases/${record.id}/verify`);
  };

  return (
    <ScrollArea className="h-full bg-background">
      <div className="mx-auto max-w-[40rem] px-10 py-20">
        <h2 className="text-2xl font-semibold text-balance">How do you want to prepare this report?</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Groundwork can draft the six factual sections from the case documents, with every statement linked to the
          passage it came from. Or you can write them yourself with the documents beside you. Either way, the evaluation
          and recommendation are written by you.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col rounded-lg border bg-background p-5">
            <h3 className="font-semibold">Start from AI drafts</h3>
            <p className="mt-1 flex-1 text-sm text-muted-foreground">
              Drafted from the police report, court transcript, case notes and criminal history. You check and approve
              every section.
            </p>
            <Button className="mt-5 self-start" onClick={() => choose("ai")}>
              Start from AI drafts <ArrowRight />
            </Button>
          </div>
          <div className="flex flex-col rounded-lg border bg-background p-5">
            <h3 className="font-semibold">Write it myself</h3>
            <p className="mt-1 flex-1 text-sm text-muted-foreground">
              Empty sections with the case documents open beside you. No AI is used for this report.
            </p>
            <Button variant="outline" className="mt-5 self-start" onClick={() => choose("manual")}>
              Write it myself
            </Button>
          </div>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          {state.mode === "unset"
            ? "You can change this later from the case outline."
            : `Currently: ${state.mode === "ai" ? "starting from AI drafts" : "writing without AI"}. Choosing again keeps anything you've written.`}
        </p>
      </div>
    </ScrollArea>
  );
}
