"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

/**
 * @file breadcrumb.tsx
 * @description shadcn/ui style breadcrumb primitives used by common/Breadcrumbs
 * @description common/Breadcrumbs から利用する shadcn/ui 風パンくずプリミティブ
 */

export function Breadcrumb({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <nav aria-label="breadcrumb" className={className} {...props} />;
}

export function BreadcrumbList({ className, ...props }: React.OlHTMLAttributes<HTMLOListElement>) {
  return (
    <ol
      className={cn(
        "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center text-sm text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

export function BreadcrumbItem({ className, ...props }: React.LiHTMLAttributes<HTMLLIElement>) {
  return <li className={cn("inline-flex items-center", className)} {...props} />;
}

export function BreadcrumbSeparator({ className, children, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span role="presentation" className={cn("mx-2 select-none", className)} {...props}>
      {children ?? "/"}
    </span>
  );
}

export function BreadcrumbLink({ asChild, className, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "a";
  return <Comp className={cn("hover:underline hover:text-foreground", className)} {...props} />;
}

export function BreadcrumbPage({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span aria-current="page" className={cn("text-foreground font-medium", className)} {...props} />;
}

export function BreadcrumbEllipsis({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("w-4 h-4", className)} {...props}>…</span>;
}


