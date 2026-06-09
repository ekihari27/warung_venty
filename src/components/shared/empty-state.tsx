import type { LucideIcon } from "lucide-react";
import { Package } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function EmptyState({
  icon: Icon = Package,
  title,
  description,
  children,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200/70 bg-white/90 p-10 text-center shadow-sm shadow-slate-900/5 dark:border-slate-800/70 dark:bg-slate-950/80">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-100">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-slate-950 dark:text-white mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-4">
          {description}
        </p>
      )}
      {children}
    </div>
  );
}
