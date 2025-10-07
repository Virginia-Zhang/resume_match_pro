/**
 * @file skeleton.tsx
 * @description Simple Skeleton component (shadcn/ui style) for loading placeholders.
 * @description 読み込みプレースホルダー用のシンプルなSkeletonコンポーネント（shadcn/uiスタイル）。
 * @author Virginia Zhang
 * @remarks Client component. Pure UI; no business logic.
 * @remarks クライアントコンポーネント。純粋なUIで、ビジネスロジックなし。
 */
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * @component Skeleton
 * @description Renders a gray animated block as a loading placeholder.
 * @description ローディング用の灰色アニメーションブロックを表示する。
 * @returns {JSX.Element} Skeleton element
 * @returns {JSX.Element} Skeleton要素
 */
export function Skeleton({
  className,
  ...props
}: SkeletonProps): React.ReactElement {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200/70 dark:bg-slate-700/70",
        className
      )}
      {...props}
    />
  );
}

export default Skeleton;
