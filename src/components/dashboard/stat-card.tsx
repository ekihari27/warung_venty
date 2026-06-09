import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color: "emerald" | "blue" | "purple" | "amber" | "red";
  variant?: "default" | "warning" | "danger";
  suffix?: string;
  isString?: boolean;
}

const colorMap = {
  emerald: {
    icon: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-100/90 dark:bg-emerald-900/40",
  },
  blue: {
    icon: "text-sky-600 dark:text-sky-400",
    iconBg: "bg-sky-100/90 dark:bg-sky-900/40",
  },
  purple: {
    icon: "text-violet-600 dark:text-violet-400",
    iconBg: "bg-violet-100/90 dark:bg-violet-900/40",
  },
  amber: {
    icon: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-100/90 dark:bg-amber-900/40",
  },
  red: {
    icon: "text-rose-600 dark:text-rose-400",
    iconBg: "bg-rose-100/90 dark:bg-rose-900/40",
  },
};

export function StatCard({
  title,
  value,
  icon: Icon,
  color,
  variant = "default",
  suffix = "",
  isString = false,
}: StatCardProps) {
  const colors = colorMap[color];
  const statusLabel =
    variant === "danger"
      ? "Segera periksa"
      : variant === "warning"
      ? "Perlu perhatian"
      : "Stabil";

  return (
    <Card
      className={cn(
        "p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-slate-300/50 dark:hover:border-slate-800/80 cursor-default",
        variant === "warning" && "border-amber-300/40 dark:border-amber-600/40",
        variant === "danger" && "border-rose-300/40 dark:border-rose-600/40"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
            {title}
          </p>
          <div className="flex items-baseline gap-1.5">
            <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {isString ? value : typeof value === "number" ? value.toLocaleString("id-ID") : value}
            </p>
            {suffix ? (
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                {suffix}
              </span>
            ) : null}
          </div>
        </div>
        <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", colors.iconBg)}>
          <Icon className={cn("w-5 h-5", colors.icon)} />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <span
          className={cn(
            "rounded-lg px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider",
            variant === "danger"
              ? "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-450"
              : variant === "warning"
              ? "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-450"
              : "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-450"
          )}
        >
          {statusLabel}
        </span>
      </div>
    </Card>
  );
}
