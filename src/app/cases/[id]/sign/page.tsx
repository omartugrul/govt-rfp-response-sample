"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCase } from "@/components/case/case-context";
import { ReportDocument } from "@/components/case/report-document";
import { SignaturePad } from "@/components/case/signature-pad";
import { OFFICER, OFFICER_TITLE } from "@/lib/cases";
import { assessmentDone, factsDone } from "@/lib/case-state";
import { cn } from "@/lib/utils";

export default function SignPage() {
  const { record, state, sign } = useCase();
  const router = useRouter();
  const [attested, setAttested] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);

  const checks = [
    { ok: factsDone(state), label: "All six factual sections verified and approved", href: "verify" },
    { ok: assessmentDone(state), label: "Evaluation and recommendation written and final", href: "assess" },
  ];
  const ready = checks.every((c) => c.ok);
  const canSign = ready && attested && !!signature;

  return (
    <ScrollArea className="h-full bg-muted/40">
      <div className="mx-auto max-w-[52rem] px-8 py-12">
        <ReportDocument />

        {!state.signed && (
          <form
            aria-labelledby="sign-heading"
            className="mt-10 rounded-lg border bg-background p-8"
            onSubmit={(e) => {
              e.preventDefault();
              if (!canSign) return;
              sign(OFFICER, signature!);
              router.push(`/cases/${record.id}/done`);
            }}
          >
            <h2 id="sign-heading" className="text-xl font-semibold">
              Sign and file
            </h2>
            <ul className="mt-4 space-y-2">
              {checks.map((c) => (
                <li key={c.label} className={cn("flex items-center gap-2 text-sm", !c.ok && "text-muted-foreground")}>
                  {c.ok ? <CheckCircle2 className="size-4 text-approved" /> : <Circle className="size-4" />}
                  {c.label}
                  {!c.ok && (
                    <Link href={`/cases/${record.id}/${c.href}`} className="text-primary underline">
                      Go there
                    </Link>
                  )}
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-start gap-3 border-t pt-6">
              <Checkbox
                id="attest"
                checked={attested}
                onCheckedChange={(v) => setAttested(v === true)}
                disabled={!ready}
                className="mt-0.5"
              />
              <Label htmlFor="attest" className="text-sm leading-relaxed font-normal">
                I am the author of this report. I have reviewed all AI-drafted content against the source documents
                and take responsibility for its accuracy.
              </Label>
            </div>
            <div className="mt-6">
              <Label className="mb-2 block">Signature</Label>
              <SignaturePad onChange={setSignature} disabled={!ready || !attested} />
            </div>
            <div className="mt-6 flex items-end justify-between gap-6">
              <p className="text-sm text-muted-foreground">
                Signing as <span className="font-medium text-foreground">{OFFICER}</span>, {OFFICER_TITLE}
              </p>
              <Button type="submit" size="lg" disabled={!canSign}>
                Sign and file report
              </Button>
            </div>
          </form>
        )}

        {state.signed && (
          <div className="mt-8 flex justify-center">
            <Link href={`/cases/${record.id}/done`} className={buttonVariants({ variant: "outline" })}>
              Back to summary
            </Link>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
