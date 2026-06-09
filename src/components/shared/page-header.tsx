"use client";

import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import type { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
    icon?: LucideIcon;
  };
  children?: React.ReactNode;
}

export function PageHeader({ title, description, action, children }: PageHeaderProps) {
  return (
    <ScrollReveal className="flex flex-col gap-4 rounded-3xl border border-slate-200/70 bg-white/90 px-6 py-5 shadow-sm shadow-slate-900/5 dark:border-slate-800/70 dark:bg-slate-950/85 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{title}</h1>
        {description && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{description}</p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {children}
        {action && (
          <Button onClick={action.onClick} className="shrink-0" variant="outline">
            {action.icon && <action.icon className="w-4 h-4 mr-2" />}
            {action.label}
          </Button>
        )}
      </div>
    </ScrollReveal>
  );
}
