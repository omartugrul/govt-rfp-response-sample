"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCase } from "@/components/case/case-context";
import { DOCUMENTS, docTitle, type DocId } from "@/lib/cases";
import { cn } from "@/lib/utils";

/**
 * The source documents, live beside the report. Shows the document behind the active citation,
 * scrolled to its passage; this section's other passages in the same document are lightly marked.
 */
export function DocumentViewer({
  sectionId,
  activeCite,
  onCite,
}: {
  sectionId: string;
  activeCite: number;
  onCite: (n: number) => void;
}) {
  const { draft } = useCase();
  const cites = draft.sections.find((s) => s.id === sectionId)?.segments.flatMap((s) => s.cites) ?? [];
  const active = cites[activeCite - 1];
  const [viewing, setViewing] = useState<DocId>(active?.doc ?? "police-report");
  const [shownCite, setShownCite] = useState(activeCite);
  const markRef = useRef<HTMLElement>(null);

  // Following a citation switches to its document (adjusting state during render, not in an effect).
  if (shownCite !== activeCite) {
    setShownCite(activeCite);
    if (active) setViewing(active.doc);
  }

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    markRef.current?.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
  }, [activeCite, viewing]);

  const text = draft.documents[viewing];
  // This section's passages in the viewed document, in reading order, without overlaps.
  const marks = cites
    .map((c, i) => ({ ...c, n: i + 1 }))
    .filter((c) => c.doc === viewing)
    .sort((a, b) => a.start - b.start);
  const pieces: React.ReactNode[] = [];
  let at = 0;
  for (const m of marks) {
    if (m.start < at) continue;
    pieces.push(text.slice(at, m.start));
    const isActive = m.n === activeCite;
    pieces.push(
      <mark
        key={m.n}
        ref={isActive ? markRef : undefined}
        onClick={() => onCite(m.n)}
        title={`Source ${m.n}`}
        className={cn(
          "cursor-pointer rounded-sm px-0.5 text-foreground transition-colors",
          isActive ? "bg-cite ring-2 ring-ring/60" : "bg-cite/35 hover:bg-cite/60",
        )}
      >
        {text.slice(m.start, m.end)}
      </mark>,
    );
    at = m.end;
  }
  pieces.push(text.slice(at));

  const source = DOCUMENTS.find((d) => d.id === viewing)?.source;

  return (
    <section aria-label="Source documents" className="flex h-full min-h-0 flex-col border-l bg-background">
      <div className="flex items-center justify-between gap-3 border-b px-5 py-3">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold">
            Source {activeCite} of {cites.length}
            <span className="font-normal text-muted-foreground"> · {active && docTitle(active.doc)}</span>
          </h2>
          <p className="text-xs text-muted-foreground">Click a sentence or number in the report to jump to its source.</p>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Previous source"
            disabled={activeCite <= 1}
            onClick={() => onCite(activeCite - 1)}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Next source"
            disabled={activeCite >= cites.length}
            onClick={() => onCite(activeCite + 1)}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>

      <Tabs value={viewing} onValueChange={(v) => setViewing(v as DocId)} className="gap-0">
        <TabsList className="mx-5 mt-3 w-[calc(100%-2.5rem)]">
          {DOCUMENTS.map((d) => (
            <TabsTrigger key={d.id} value={d.id} className="text-xs">
              {d.title}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <ScrollArea className="min-h-0 flex-1">
        <div className="px-6 py-5">
          <p className="mb-3 text-xs text-muted-foreground">From {source}</p>
          <pre className="font-sans text-sm leading-relaxed whitespace-pre-wrap">{pieces}</pre>
        </div>
      </ScrollArea>
    </section>
  );
}
