"use client";

import Link from "next/link";
import { CalendarDays, FileStack, Scale } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { CASES } from "@/lib/cases";
import { readCaseStatus, useHydrated } from "@/lib/case-state";

export function AppSidebar() {
  const hydrated = useHydrated();
  const open = CASES.filter((c) => (c.sample ? c.sample.status : hydrated && !c.juvenile ? readCaseStatus(c.id) : "") !== "Signed").length;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        {/* The toggle stays put in both states, aligned with the nav icons; only the wordmark hides. */}
        <div className="flex h-12 items-center gap-2">
          <SidebarTrigger className="size-8 shrink-0 text-muted-foreground" />
          <Link
            href="/cases"
            className="min-w-0 rounded-md leading-tight outline-none focus-visible:ring-2 focus-visible:ring-ring group-data-[collapsible=icon]:hidden"
          >
            <span className="block truncate font-semibold">Groundwork</span>
            <span className="block truncate text-xs text-muted-foreground">County of San Diego Probation</span>
          </Link>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive render={<Link href="/cases" />} tooltip="My caseload">
                  <Scale />
                  <span>My caseload</span>
                </SidebarMenuButton>
                <SidebarMenuBadge>{open}</SidebarMenuBadge>
              </SidebarMenuItem>
              {[
                { label: "Calendar", icon: CalendarDays },
                { label: "Templates", icon: FileStack },
              ].map(({ label, icon: Icon }) => (
                <SidebarMenuItem key={label} title="Not in this demo">
                  <SidebarMenuButton aria-disabled tooltip={`${label} · not in this demo`}>
                    <Icon />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

    </Sidebar>
  );
}
