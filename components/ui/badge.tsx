"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * @file badge.tsx
 * @description Minimal shadcn-like Badge component with variants.
 * @description シンプルな Badge コンポーネント（バリアント対応）。
 */

type BadgeVariant = "default" | "secondary" | "tertiary" | "destructive" | "outline";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  const stylesByVariant: Record<BadgeVariant, string> = {
    default: "bg-green-600 text-white hover:bg-green-700",
    secondary: "bg-primary text-primary-foreground",
    tertiary: "bg-secondary text-secondary-foreground",
    destructive: "bg-destructive text-destructive-foreground",
    outline: "border border-border",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        stylesByVariant[variant],
        className
      )}
      {...props}
    />
  );
}


