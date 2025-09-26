"use client";

import React from "react";
import { usePathname } from "next/navigation";
import BrandBar from "@/components/common/BrandBar";
import Breadcrumbs, { CrumbItem } from "@/components/common/Breadcrumbs";

/**
 * @file SiteHeader.tsx
 * @description One-line header row combining Breadcrumbs (left) and BrandBar (right).
 * @description パンくず（左）とブランドバー（右）を同一行で配置するヘッダー。
 */

export default function SiteHeader(): React.ReactElement {
  const pathname = usePathname() ?? "/";

  // Build explicit items to avoid client path timing issues and to support jobs/[id]
  // クライアントのタイミング問題を避けつつ、jobs/[id] に対応するため明示的に生成
  const items: CrumbItem[] = React.useMemo(() => {
    if (pathname === "/") return [{ href: "/", label: "ホーム" }];
    if (pathname === "/upload")
      return [
        { href: "/", label: "ホーム" },
        { href: "/upload", label: "アップロード" },
      ];
    if (pathname === "/jobs")
      return [
        { href: "/", label: "ホーム" },
        { href: "/jobs", label: "求人" },
      ];
    if (pathname.startsWith("/jobs/"))
      return [
        { href: "/", label: "ホーム" },
        { href: "/jobs", label: "求人" },
        { href: pathname, label: "詳細" },
      ];
    // Fallback: generic segmentation handled inside Breadcrumbs
    return undefined as unknown as CrumbItem[];
  }, [pathname]);

  const showCrumbs = pathname !== "/";

  return (
    <div className="w-full fixed top-0 inset-x-0 z-50 bg-white/35 dark:bg-slate-600/30 backdrop-blur-md supports-[backdrop-filter]:bg-white/30 border-b border-border/30 shadow-[0_0_20px_rgba(0,0,0,0.12)] dark:shadow-[0_0_24px_rgba(15,23,42,0.45)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          {showCrumbs ? <Breadcrumbs items={items} pathname={pathname} /> : null}
        </div>
        <BrandBar inline />
      </div>
    </div>
  );
}


