"use client";

import BrandBar from "@/components/common/BrandBar";
import Breadcrumbs, { CrumbItem } from "@/components/common/Breadcrumbs";
import BackButton from "@/components/common/buttons/BackButton";
import { useJobById } from "@/hooks/queries/useJobs";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";

/**
 * @file SiteHeader.tsx
 * @description One-line header row combining Breadcrumbs/Back button (left) and BrandBar (right).
 * @description パンくず（左）とブランドバー/戻るボタン（右）を同一行で配置するヘッダー。
 * @remarks Includes back button on mobile, breadcrumbs on PC for non-home pages.
 * @remarks モバイルでは戻るボタンを、PCではパンくずを表示（ホームページには表示しない）。
 */

export default function SiteHeader(): React.ReactElement {
  const pathname = usePathname() ?? "/";
  const router = useRouter();

  /**
   * @description Extract jobId from pathname for detail routes (jobs/[id]).
   * @description jobs/[id] パスから jobId を抽出。
   */
  const jobId = useMemo(() => {
    if (!pathname.startsWith("/jobs/")) return undefined;
    const segments = pathname.split("/");
    return segments[2] || undefined;
  }, [pathname]);

  /**
   * @description Fetch job detail via TanStack Query to derive breadcrumb label.
   * @description パンくず用の求人タイトル取得に TanStack Query を使用。
   */
  const { data: jobDetail } = useJobById(jobId, {
    enabled: Boolean(jobId),
  });

  const jobTitle = jobDetail?.title || "詳細";

  // Build explicit items to avoid client path timing issues and to support jobs/[id]
  // クライアントのタイミング問題を避けつつ、jobs/[id] に対応するため明示的に生成
  // Note: jobTitle is included in dependencies. Since useEffect immediately resets jobTitle
  // when pathname changes, there's no race condition. The useMemo will recompute when
  // jobTitle updates from the async fetch, which is the desired behavior.
  // 注意: jobTitle は依存配列に含まれます。useEffect が pathname 変更時にすぐに jobTitle を
  // リセットするため、競合状態はありません。useMemo は非同期取得で jobTitle が更新されたときに
  // 再計算されますが、これは期待される動作です。
  const items: CrumbItem[] = useMemo(() => {
    if (pathname === "/") return [{ href: "/", label: "ホーム" }];
    if (pathname === "/upload")
      return [
        { href: "/", label: "ホーム" },
        { href: "/upload", label: "アップロード" },
      ];
    if (pathname === "/jobs")
      return [
        { href: "/", label: "ホーム" },
        { href: "/upload", label: "アップロード" },
        { href: "/jobs", label: "求人" },
      ];
    if (pathname.startsWith("/jobs/"))
      return [
        { href: "/", label: "ホーム" },
        { href: "/upload", label: "アップロード" },
        { href: "/jobs", label: "求人" },
        { href: pathname, label: jobTitle },
      ];
    // Fallback: generic segmentation handled inside Breadcrumbs
    return undefined as unknown as CrumbItem[];
  }, [pathname, jobTitle]);

  const isHomePage = pathname === "/";

  /**
   * Handle back navigation
   * 戻るナビゲーションを処理
   */
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <div className="w-full fixed top-0 inset-x-0 z-50 bg-white/35 dark:bg-slate-600/30 backdrop-blur-md supports-[backdrop-filter]:bg-white/30 border-b border-border/30 shadow-[0_0_20px_rgba(0,0,0,0.12)] dark:shadow-[0_0_24px_rgba(15,23,42,0.45)]">
      <div className="mx-auto max-w-7xl 2xl:max-w-[85vw] px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1 flex items-center gap-2">
          {/* Navigation elements - only shown on non-home pages */}
          {/* ナビゲーション要素 - ホーム以外のページでのみ表示 */}
          {!isHomePage && (
            <>
              {/* Mobile devices: BackButton shown; Large screen: BreadCrumbs shown */}
              {/* モバイルデバイス: BackButton表示；大画面: BreadCrumbs表示 */}
              <BackButton onClick={handleBack} className="lg:hidden shrink-0 h-8 w-8 -ml-2" />
              <Breadcrumbs items={items} />
            </>
          )}
        </div>
        <BrandBar inline />
      </div>
    </div>
  );
}


