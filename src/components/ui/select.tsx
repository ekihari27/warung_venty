"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "flex h-11 w-full rounded-xl border border-slate-200/80 bg-white/50 backdrop-blur-sm px-4 text-sm text-slate-900 transition-all duration-200 focus-visible:outline-none focus-visible:border-primary/80 focus-visible:ring-4 focus-visible:ring-primary/10 hover:border-slate-300 dark:border-slate-800/80 dark:bg-slate-900/50 dark:text-slate-100 disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer",
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = "Select";

export { Select };
