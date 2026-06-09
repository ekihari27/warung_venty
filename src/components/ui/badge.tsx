import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-slate-100 text-slate-900 dark:bg-slate-800/80 dark:text-slate-100",
        secondary:
          "border-transparent bg-slate-200 text-slate-900 dark:bg-slate-800/80 dark:text-slate-100",
        destructive:
          "border-transparent bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-200",
        outline:
          "border border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100",
        success:
          "border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200",
        warning:
          "border-transparent bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200",
        info:
          "border-transparent bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
