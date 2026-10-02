import { AppShell } from "@/components/app/app-shell";

export const metadata = { title: "My caseload" };

export default function AppLayout({ children }: LayoutProps<"/cases">) {
  return <AppShell>{children}</AppShell>;
}
