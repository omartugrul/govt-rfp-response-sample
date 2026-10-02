"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bell, Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { useSearch } from "@/components/app/app-shell";
import { getCase, OFFICER, OFFICER_TITLE, OFFICER_UNIT } from "@/lib/cases";

const NOTIFICATIONS = [
  { title: "Sentencing moved", body: "People v. Alicia M. Torres is now set for Oct 9.", when: "2h ago" },
  { title: "New document", body: "A police supplemental report was added to CD-2026-105230.", when: "Yesterday" },
];

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const record = getCase(pathname.split("/")[2] ?? "");
  const { query, setQuery } = useSearch();
  const searchRef = useRef<HTMLInputElement>(null);
  const [unread, setUnread] = useState(NOTIFICATIONS.length);

  // ⌘K / Ctrl+K focuses search, as in most enterprise tools.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (pathname !== "/cases") router.push("/cases");
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pathname, router]);

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-background px-4">
      <Breadcrumb>
        <BreadcrumbList>
          {record ? (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link href="/cases" />}>My caseload</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{record.defendant}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          ) : (
            <BreadcrumbItem>
              <BreadcrumbPage>My caseload</BreadcrumbPage>
            </BreadcrumbItem>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Search is for finding a case; inside a case there's nothing to search, so it steps aside. */}
      {!record ? (
      <form
        role="search"
        className="relative ml-auto w-72"
        onSubmit={(e) => e.preventDefault()}
      >
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={searchRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search cases or defendants"
          aria-label="Search cases or defendants"
          className="pr-12 pl-8"
        />
        <kbd className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 rounded border bg-muted px-1.5 text-[11px] text-muted-foreground">
          ⌘K
        </kbd>
      </form>
      ) : (
        <div className="ml-auto" />
      )}

      <Popover onOpenChange={(open) => open && setUnread(0)}>
        <PopoverTrigger
          render={<Button variant="ghost" size="icon" className="relative" aria-label={`Notifications, ${unread} unread`} />}
        >
          <Bell />
          {unread > 0 && (
            <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
              {unread}
            </span>
          )}
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 gap-0 p-0">
          <PopoverHeader className="border-b px-4 py-3">
            <PopoverTitle>Notifications</PopoverTitle>
          </PopoverHeader>
          <ul className="divide-y">
            {NOTIFICATIONS.map((n) => (
              <li key={n.title} className="px-4 py-3">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-sm text-muted-foreground">{n.body}</p>
                <p className="mt-1 text-xs text-muted-foreground">{n.when}</p>
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" className="h-10 gap-2 px-1.5" aria-label={`Account: ${OFFICER}`} />}
        >
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">JR</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="font-normal">
              <p className="text-sm font-medium text-foreground">{OFFICER}</p>
              <p className="text-xs text-muted-foreground">{OFFICER_TITLE}</p>
              <p className="text-xs text-muted-foreground">{OFFICER_UNIT}</p>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>Settings</DropdownMenuItem>
          <DropdownMenuItem disabled>Sign out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
