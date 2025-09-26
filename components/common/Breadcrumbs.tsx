"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useBreadcrumbsContext } from "@/components/common/BreadcrumbsProvider";

/**
 * @file Breadcrumbs.tsx
 * @description Reusable breadcrumb component for page navigation (JP labels).
 * @description ページ遷移用の再利用可能なパンくずリスト（日本語ラベル）。
 * @author Virginia Zhang
 * @remarks Client component; prefers caller-provided items; falls back to path segmentation.
 * @remarks クライアント。呼び出し側の items を優先し、未指定時はパスを分割して生成。
 */

export type CrumbItem = {
  href?: string;
  label: string;
};

/**
 * @description Map common route segments to JP labels.
 * @description 一般的なルートセグメントを日本語ラベルにマッピング。
 */
const segmentLabelMap: Record<string, string> = {
  "": "ホーム",
  home: "ホーム",
  upload: "アップロード",
  jobs: "求人",
  // match & details are API-only; job detail is jobs/[id]
};

function toLabel(seg: string): string {
  return segmentLabelMap[seg] ?? seg;
}

/**
 * @component Breadcrumbs
 * @description Renders breadcrumbs based on provided items or current pathname.
 * @description 指定の items か現在のパスからパンくずを生成して表示します。
 * @param root0 - Props
 * @param root0.items - Optional items to render (overrides auto)
 * @param root0.pathname - Optional pathname override
 * @returns {React.ReactElement} Breadcrumb list element
 */
export default function Breadcrumbs({
  items,
  pathname,
}: {
  items?: CrumbItem[];
  pathname?: string;
}) {
  const current = usePathname();
  const path = pathname ?? current ?? "/";
  const ctx = useBreadcrumbsContext();
  const autoItems: CrumbItem[] = React.useMemo(() => {
    if (items && items.length > 0) return items;
    if (ctx?.items && ctx.items.length > 0) return ctx.items;
    const parts = path.split("/").filter(Boolean);
    const acc: CrumbItem[] = [{ href: "/", label: toLabel("") }];
    let cur = "";
    for (const p of parts) {
      cur += `/${p}`;
      acc.push({ href: cur, label: toLabel(p) });
    }
    return acc;
  }, [ctx?.items, items, path]);

  if (autoItems.length <= 1) return null; // hide on homepage

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {autoItems.map((c, i) => {
          const isLast = i === autoItems.length - 1;
          return (
            <BreadcrumbItem key={`${c.label}-${i}`}>
              {isLast || !c.href ? (
                <BreadcrumbPage>{c.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={c.href}>{c.label}</Link>
                </BreadcrumbLink>
              )}
              {!isLast && <BreadcrumbSeparator />}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
