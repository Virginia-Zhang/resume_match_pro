"use client";

import React from "react";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

/**
 * @file Breadcrumbs.tsx
 * @description Reusable breadcrumb component for page navigation (JP labels).
 * @description ページ遷移用の再利用可能なパンくずリスト（日本語ラベル）。
 * @author Virginia Zhang
 * @remarks Client component that renders breadcrumb items passed via props.
 * @remarks クライアントコンポーネント。props で渡されたパンくず項目を表示します。
 */

export type CrumbItem = {
  href?: string;
  label: string;
};

/**
 * @component Breadcrumbs
 * @description Renders breadcrumbs based on provided items.
 * @description 指定の items からパンくずを生成して表示します。
 * @param root0 - Props
 * @param root0.items - Breadcrumb items to render
 * @param root0.items 表示するパンくず項目
 * @returns {React.ReactElement} Breadcrumb list element
 * @returns {React.ReactElement} パンくずリスト要素
 */
export default function Breadcrumbs({
  items,
}: {
  items: CrumbItem[];
}) {
  if (!items || items.length <= 1) return null; // hide on homepage

  return (
    <Breadcrumb className="hidden sm:block">
      <BreadcrumbList>
        {items.map((c, i) => {
          const isLast = i === items.length - 1;
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
