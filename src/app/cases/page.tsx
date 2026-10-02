"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSearch } from "@/components/app/app-shell";
import { CaseStatusBadge } from "@/components/case-status-badge";
import { StatusBadge } from "@/components/status-badge";
import { CASES, DEMO_TODAY, type CaseRecord } from "@/lib/cases";
import { readCaseStatus, useHydrated, type CaseStatus } from "@/lib/case-state";
import { cn } from "@/lib/utils";

const DAY = 86_400_000;
const daysLeft = (due: string) => Math.round((Date.parse(due) - Date.parse(DEMO_TODAY)) / DAY);

function dueLabel(days: number) {
  if (days < 0) return `${-days} ${days === -1 ? "day" : "days"} ago`;
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}

export default function CaseloadPage() {
  const hydrated = useHydrated();
  const { query, setQuery } = useSearch();
  const statusOf = (c: CaseRecord): CaseStatus | null =>
    c.sample ? c.sample.status : c.juvenile ? null : hydrated ? readCaseStatus(c.id) : null;

  // Open reports by due date, then signed ones (most recent first).
  const sorted = [...CASES].sort((a, b) => {
    const signedA = statusOf(a) === "Signed" ? 1 : 0;
    const signedB = statusOf(b) === "Signed" ? 1 : 0;
    return signedA - signedB || a.dueDate.localeCompare(b.dueDate) * (signedA ? -1 : 1);
  });
  const q = query.trim().toLowerCase();
  const rows = q
    ? sorted.filter((c) => `${c.defendant} ${c.caseNumber} ${c.chargeShort}`.toLowerCase().includes(q))
    : sorted;
  const open = sorted.filter((c) => statusOf(c) !== "Signed").length;
  const dueThisWeek = sorted.filter((c) => statusOf(c) !== "Signed" && daysLeft(c.dueDate) <= 7).length;

  return (
    <main className="h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl px-8 py-10">
        <h1 className="text-2xl font-semibold">My caseload</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {open} open reports, {dueThisWeek} due this week
        </p>

        <div className="mt-6 rounded-lg border bg-background">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-5">Defendant</TableHead>
                <TableHead>Charge</TableHead>
                <TableHead>Report due</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((c) => {
                const status = statusOf(c);
                const days = daysLeft(c.dueDate);
                const signed = status === "Signed";
                // Sample rows only fill out the list; they're visibly inert so nobody expects them to open.
                const inert = !!c.sample;
                return (
                  <TableRow
                    key={c.id}
                    aria-disabled={inert || undefined}
                    title={inert ? "Sample record, not part of this demo" : undefined}
                    className={cn(
                      inert
                        ? "opacity-50 hover:bg-transparent"
                        : "group relative cursor-pointer has-[:focus-visible]:bg-muted has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-inset",
                      signed && !inert && "text-muted-foreground",
                    )}
                  >
                    <TableCell className="py-3 pl-5">
                      {inert ? (
                        <span className="font-medium">{c.defendant}</span>
                      ) : (
                        // Stretched over the whole row, so any click on the row opens the case.
                        <Link href={`/cases/${c.id}`} className="font-medium outline-none after:absolute after:inset-0">
                          {c.defendant}
                        </Link>
                      )}
                      <div className="text-xs text-muted-foreground tabular-nums">{c.caseNumber}</div>
                    </TableCell>
                    <TableCell>{c.chargeShort}</TableCell>
                    <TableCell>
                      <div className="tabular-nums">{c.reportDue.replace(", 2026", "")}</div>
                      {!signed && (
                        <div
                          className={cn(
                            "text-xs",
                            days <= 3 && !inert ? "font-medium text-review-foreground" : "text-muted-foreground",
                          )}
                        >
                          {dueLabel(days)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {c.juvenile ? (
                        <StatusBadge tone="neutral">Juvenile, no AI draft</StatusBadge>
                      ) : (
                        status && <CaseStatusBadge status={status} />
                      )}
                    </TableCell>
                    <TableCell className="pr-4">
                      {!inert && (
                        <ChevronRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {rows.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                    No cases match “{query}”.{" "}
                    <Button variant="link" className="h-auto p-0" onClick={() => setQuery("")}>
                      Clear search
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </main>
  );
}
