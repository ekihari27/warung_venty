import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-slate-200/80 bg-white/50 backdrop-blur-sm px-4 text-sm text-slate-900 transition-all duration-200 placeholder:text-slate-400 focus-visible:outline-none focus-visible:border-primary/80 focus-visible:ring-4 focus-visible:ring-primary/10 hover:border-slate-300 dark:border-slate-800/80 dark:bg-slate-900/50 dark:text-slate-100 dark:placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
