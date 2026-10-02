import { notFound } from "next/navigation";
import { VerifySection } from "@/components/case/verify-section";
import { SECTIONS } from "@/lib/report";

const FACTS = SECTIONS.filter((d) => d.author === "ai");

export function generateStaticParams() {
  return FACTS.map((d) => ({ section: d.id }));
}

export default async function VerifySectionPage({ params }: PageProps<"/cases/[id]/verify/[section]">) {
  const { section } = await params;
  if (!FACTS.some((d) => d.id === section)) notFound();
  return <VerifySection sectionId={section} />;
}
