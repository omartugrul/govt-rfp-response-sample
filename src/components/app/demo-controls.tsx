"use client";

import Link from "next/link";
import { Info, RotateCcw } from "lucide-react";
import { CASES } from "@/lib/cases";
import { clearCase } from "@/lib/case-state";

// The only case with saved progress to clear.
const DEMO_CASE = CASES.find((c) => c.draft)!;

/**
 * Demo-only controls, deliberately styled like the intro page rather than the product,
 * so nobody mistakes them for part of the application.
 */
export function DemoControls() {
  return (
    <div
      role="region"
      aria-label="Demo controls"
      className="fixed right-4 bottom-4 z-50 flex items-center gap-1 rounded-full bg-neutral-900 py-1 pr-1 pl-3.5 text-sm text-white shadow-[0_2px_4px_rgb(0_0_0/0.12),0_8px_24px_-6px_rgb(0_0_0/0.25)]"
    >
      <span className="mr-1 text-xs font-medium tracking-wide text-white/60">Demo</span>
      <Link
        href="/"
        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/70"
      >
        <Info className="size-3.5" /> About
      </Link>
      <button
        type="button"
        onClick={() => {
          clearCase(DEMO_CASE.id);
          // Stay on the current screen: reload it so everything re-reads the cleared progress.
          window.location.reload();
        }}
        className="flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/70"
      >
        <RotateCcw className="size-3.5" /> Reset
      </button>
    </div>
  );
}
