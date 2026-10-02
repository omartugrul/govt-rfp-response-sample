"use client";

import { History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useCase } from "@/components/case/case-context";
import { formatTime } from "@/components/case/fact-section";
import { OFFICER } from "@/lib/cases";

/** Every AI draft and officer action on the case, newest first. */
export function ActivityList() {
  const { state } = useCase();
  if (state.history.length === 0) {
    return <p className="py-3 text-sm text-muted-foreground">Nothing yet. Actions on this report will appear here.</p>;
  }
  return (
    <ol className="divide-y">
      {[...state.history].reverse().map((e, i) => (
        <li key={i} className="grid grid-cols-[8.5rem_1fr] gap-4 py-3 text-sm">
          <span className="text-muted-foreground tabular-nums">{formatTime(e.at)}</span>
          <span>
            <span className="font-medium">{e.action}</span>
            <span className="text-muted-foreground"> by {e.actor === "AI" ? "AI" : OFFICER}</span>
            {e.detail && <span className="block text-muted-foreground">{e.detail}</span>}
          </span>
        </li>
      ))}
    </ol>
  );
}

/** Case-header button that opens the activity log in a side panel, from any step. */
export function ActivityButton() {
  const { state } = useCase();
  return (
    <Sheet>
      <Tooltip>
        <TooltipTrigger
          render={
            <SheetTrigger
              render={<Button variant="ghost" size="icon-sm" aria-label="Activity" className="-mr-1.5 shrink-0 text-muted-foreground" />}
            />
          }
        >
          <History />
        </TooltipTrigger>
        <TooltipContent>Activity</TooltipContent>
      </Tooltip>
      <SheetContent className="w-full gap-0 sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle>Activity</SheetTitle>
          <SheetDescription>
            Every AI draft and officer action on this report. {state.history.length}{" "}
            {state.history.length === 1 ? "event" : "events"}.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="min-h-0 flex-1">
          <div className="px-4">
            <ActivityList />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
