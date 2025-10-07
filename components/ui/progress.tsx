"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * @file progress.tsx
 * @description Minimal determinate progress bar.
 */

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  indeterminate?: boolean;
}

export function Progress({ value = 0, indeterminate = false, className, ...props }: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-700/60",
        className
      )}
      {...props}
    >
      {indeterminate ? (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-[-40%] top-0 h-full w-[40%] rounded-full bg-sky-500 animate-[progress-indeterminate_1.2s_ease-in-out_infinite]" />
        </div>
      ) : (
        <div
          className="h-full rounded-full bg-sky-500 transition-[width] duration-300"
          style={{ width: `${clamped}%` }}
        />
      )}
    </div>
  );
}


