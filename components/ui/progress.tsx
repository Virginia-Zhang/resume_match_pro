"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * @file progress.tsx
 * @description Minimal determinate progress bar.
 */

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
}

export function Progress({ value = 0, className, ...props }: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-700/60",
        className
      )}
      {...props}
    >
      <div
        className="h-full rounded-full bg-sky-500 transition-[width] duration-300"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}


