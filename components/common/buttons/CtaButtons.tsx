"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * @file CtaButtons.tsx
 * @description Reusable CTA buttons shared across multiple pages.
 * @description 複数ページで共有する再利用可能なCTAボタン。
 */

type ButtonProps = React.ComponentProps<typeof Button>;

/**
 * @component PrimaryCtaButton
 * @description Blue pill-shaped button used for primary actions.
 * @description 主要アクション向けの青いピル型ボタン。
 */
export function PrimaryCtaButton({ className, ...props }: ButtonProps): JSX.Element {
  return (
    <Button
      className={cn(
        "h-12 sm:h-14 md:h-16 px-6 sm:px-10 text-base sm:text-lg font-rounded font-semibold rounded-full bg-sky-500 text-white hover:bg-sky-600 shadow-[0_8px_0_rgba(14,116,144,0.4)] hover:shadow-[0_12px_0_rgba(14,116,144,0.45)] transition-all disabled:opacity-60 disabled:shadow-none w-auto",
        className
      )}
      {...props}
    />
  );
}

/**
 * @component SecondaryCtaButton
 * @description Neutral pill-shaped button for secondary actions.
 * @description 二次アクション用のニュートラルなピル型ボタン。
 */
export function SecondaryCtaButton({ className, ...props }: ButtonProps): JSX.Element {
  return (
    <Button
      className={cn(
        "h-12 sm:h-14 md:h-16 px-10 sm:px-12 text-base sm:text-lg font-rounded font-semibold rounded-full bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 shadow-[0_6px_18px_rgba(15,23,42,0.08)] hover:shadow-[0_10px_24px_rgba(15,23,42,0.12)] dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 dark:border-slate-600 transition-all disabled:opacity-60 disabled:shadow-none",
        className
      )}
      {...props}
    />
  );
}


