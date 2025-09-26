"use client";

import React from "react";
import type { CrumbItem } from "@/components/common/Breadcrumbs";

/**
 * @file BreadcrumbsProvider.tsx
 * @description Context provider allowing pages to override breadcrumb items.
 * @description 各ページでパンくずの項目を上書きできるようにするコンテキストプロバイダ。
 */

type Ctx = { items?: CrumbItem[] };

const BreadcrumbsContext = React.createContext<Ctx | undefined>(undefined);

export function useBreadcrumbsContext(): Ctx | undefined {
  return React.useContext(BreadcrumbsContext);
}

export default function BreadcrumbsProvider({ children, items }: { children: React.ReactNode; items?: CrumbItem[] }) {
  const value = React.useMemo(() => ({ items }), [items]);
  return <BreadcrumbsContext.Provider value={value}>{children}</BreadcrumbsContext.Provider>;
}


