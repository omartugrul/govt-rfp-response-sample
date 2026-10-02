"use client";

import { createContext, useContext, useState } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app/app-sidebar";
import { TopBar } from "@/components/app/top-bar";
import { DemoControls } from "@/components/app/demo-controls";

const SearchContext = createContext<{ query: string; setQuery: (q: string) => void }>({
  query: "",
  setQuery: () => {},
});

/** The caseload search box lives in the top bar; the caseload table reads it. */
export const useSearch = () => useContext(SearchContext);

export function AppShell({ children }: { children: React.ReactNode }) {
  const [query, setQuery] = useState("");

  return (
    <SearchContext.Provider value={{ query, setQuery }}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="h-svh min-w-0 overflow-hidden">
          <TopBar />
          <div className="min-h-0 flex-1 overflow-hidden bg-muted/40">{children}</div>
        </SidebarInset>
        <DemoControls />
      </SidebarProvider>
    </SearchContext.Provider>
  );
}
