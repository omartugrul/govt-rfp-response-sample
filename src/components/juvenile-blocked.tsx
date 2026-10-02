import { Ban } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { CaseRecord } from "@/lib/cases";

export function JuvenileBlocked({ record }: { record: CaseRecord }) {
  return (
    <main className="mx-auto h-full max-w-[44rem] overflow-y-auto px-8 py-16">
      <h1 className="text-2xl font-semibold">
        {record.defendant}, {record.age}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground tabular-nums">
        Case {record.caseNumber} · {record.charge} · Report due {record.reportDue}
      </p>
      <Alert className="mt-8 bg-background">
        <Ban />
        <AlertTitle>AI drafting is not available for this case</AlertTitle>
        <AlertDescription>
          The defendant is a juvenile. Under County policy, AI report writing is not used for reports on juvenile
          defendants. No case documents were sent for AI processing. Prepare this report using the standard process.
        </AlertDescription>
      </Alert>
    </main>
  );
}
