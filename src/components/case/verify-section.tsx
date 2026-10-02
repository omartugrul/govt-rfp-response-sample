"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCase } from "@/components/case/case-context";
import { DocumentViewer } from "@/components/case/document-viewer";
import { FactSection } from "@/components/case/fact-section";
import { SECTIONS } from "@/lib/report";

const FACTS = SECTIONS.filter((d) => d.author === "ai");

/** Step 1 for one section: the AI draft beside its live source documents. */
export function VerifySection({ sectionId }: { sectionId: string }) {
  const { record, state } = useCase();
  const router = useRouter();
  // Every section opens on its first source.
  const [activeCite, setActiveCite] = useState(1);
  const def = FACTS.find((d) => d.id === sectionId)!;

  const goToNextOpen = () => {
    const start = FACTS.findIndex((d) => d.id === sectionId);
    // The section just approved isn't reflected in `state` yet, so it's excluded explicitly.
    const ordered = [...FACTS.slice(start + 1), ...FACTS.slice(0, start)];
    const next = ordered.find((d) => state.sections[d.id].status !== "approved");
    if (next) {
      router.push(`/cases/${record.id}/verify/${next.id}`);
    } else {
      toast.success("All facts verified", { description: "Next, write your evaluation and recommendation." });
      router.push(`/cases/${record.id}/assess`);
    }
  };

  return (
    <ResizablePanelGroup orientation="horizontal" className="h-full min-h-0">
      <ResizablePanel defaultSize="55%" minSize="35%">
        <ScrollArea className="h-full min-h-0 bg-background">
          <div className="px-10 py-12">
            <FactSection
              key={`${def.id}:${state.sections[def.id].custom}`}
              def={def}
              activeCite={activeCite}
              onCite={setActiveCite}
              onApproved={goToNextOpen}
            />
          </div>
        </ScrollArea>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize="45%" minSize="30%">
        <DocumentViewer sectionId={def.id} activeCite={activeCite} onCite={setActiveCite} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
