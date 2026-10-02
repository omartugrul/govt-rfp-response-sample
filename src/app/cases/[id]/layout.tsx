import { notFound, redirect } from "next/navigation";
import { CaseProvider } from "@/components/case/case-context";
import { CaseOutline } from "@/components/case/case-outline";
import { JuvenileBlocked } from "@/components/juvenile-blocked";
import { CASES, getCase } from "@/lib/cases";

export function generateStaticParams() {
  return CASES.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: LayoutProps<"/cases/[id]">) {
  const record = getCase((await params).id);
  return { title: record ? `${record.defendant} · ${record.caseNumber}` : "Case not found" };
}

export default async function CaseLayout({ params, children }: LayoutProps<"/cases/[id]">) {
  const { id } = await params;
  const record = getCase(id);
  if (!record) notFound();
  if (record.sample) redirect("/cases");
  if (record.juvenile || !record.draft) return <JuvenileBlocked record={record} />;
  return (
    <CaseProvider caseId={record.id}>
      <div className="grid h-full grid-cols-[16rem_minmax(0,1fr)] grid-rows-[minmax(0,1fr)] overflow-hidden">
        <CaseOutline />
        <div className="min-h-0 min-w-0 overflow-hidden">{children}</div>
      </div>
    </CaseProvider>
  );
}
