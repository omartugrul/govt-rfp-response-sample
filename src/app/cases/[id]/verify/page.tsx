"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCase } from "@/components/case/case-context";
import { SECTIONS } from "@/lib/report";

const FACTS = SECTIONS.filter((d) => d.author === "ai");

/** Step 1 opens on the first section that still needs review. */
export default function VerifyIndexPage() {
  const { record, state } = useCase();
  const router = useRouter();
  useEffect(() => {
    const next = FACTS.find((d) => state.sections[d.id].status !== "approved") ?? FACTS[0];
    router.replace(`/cases/${record.id}/verify/${next.id}`);
  }, [record.id, state, router]);
  return null;
}
