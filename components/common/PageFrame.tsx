"use client";

import React from "react";
import { usePathname } from "next/navigation";

/**
 * @file PageFrame.tsx
 * @description Conditional page background wrapper. Applies light blue / dark navy except on homepage.
 * @description 条件付き背景ラッパー。ホーム以外でライト青/ダーク紺(#0c1b2e)を適用。
 */

export default function PageFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const usePlain = pathname === "/"; // homepage keeps its original background

  return (
    <div
      className={
        usePlain
          ? undefined
          : "bg-[#ecf5ff] dark:bg-[#0c1b2e] min-h-screen pt-14"
      }
    >
      {/* account for fixed header height with top padding */}
      {usePlain ? <div className="pt-14">{children}</div> : children}
    </div>
  );
}

