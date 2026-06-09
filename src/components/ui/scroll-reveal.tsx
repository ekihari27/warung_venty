"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
  className?: string;
  children: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
}

export function ScrollReveal({
  className,
  children,
  threshold = 0.12,
  rootMargin = "0px 0px -12% 0px",
}: ScrollRevealProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return (
    <div
      ref={ref}
      className={cn(
        "scroll-reveal will-change-transform",
        visible && "scroll-reveal-visible",
        className
      )}
    >
      {children}
    </div>
  );
}
