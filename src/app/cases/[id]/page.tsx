"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCase } from "@/components/case/case-context";
import { currentStep } from "@/lib/case-state";

/** Opening a case lands the officer on the step they're up to. */
export default function CaseIndexPage() {
  const { record, state } = useCase();
  const router = useRouter();
  useEffect(() => {
    router.replace(`/cases/${record.id}/${currentStep(state)}`);
  }, [record.id, state, router]);
  return null;
}
