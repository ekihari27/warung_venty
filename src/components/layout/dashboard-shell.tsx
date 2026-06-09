"use client";

import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/sidebar-store";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebarStore();

  return (
    <div
      className={cn(
        "min-h-screen flex flex-col transition-all duration-300 bg-[hsl(var(--background))] text-foreground",
        collapsed ? "lg:ml-[72px]" : "lg:ml-72"
      )}
    >
      {children}
    </div>
  );
}
