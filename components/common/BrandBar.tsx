"use client";

import React from "react";
import ThemeToggle from "@/components/theme-toggle";
import { PRODUCT_MARK } from "@/app/constants/constants";

/**
 * @file BrandBar.tsx
 * @description Global brand bar placed at the top-right across pages. Shows brand mark and theme toggle.
 * @description 全ページ上部右側に配置するグローバルなブランドバー。ブランド表記とテーマ切替を表示。
 * @author Virginia Zhang
 * @remarks Client component; consumed in Root layout. | クライアントコンポーネント（ルートレイアウトから使用）。
 */

/**
 * @component BrandBar
 * @description Renders product mark and theme toggle aligned to the right.
 * @description 右寄せでブランド表記とテーマ切替を表示します。
 * @returns {JSX.Element} JSX element | JSX要素
 */
export default function BrandBar({ inline = false }: { inline?: boolean }): React.JSX.Element {
  const Inner = (
    <div className="flex items-center justify-end gap-4">
      <div className="text-sm md:text-base font-semibold tracking-wide text-foreground select-none">
        {PRODUCT_MARK}
      </div>
      <ThemeToggle />
    </div>
  );

  if (inline) return Inner;
  return (
    <div className="w-full py-3">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{Inner}</div>
    </div>
  );
}
