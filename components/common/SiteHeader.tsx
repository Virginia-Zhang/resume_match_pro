"use client";

import BrandBar from "@/components/common/BrandBar";
import Breadcrumbs, { CrumbItem } from "@/components/common/Breadcrumbs";
import BackButton from "@/components/common/buttons/BackButton";
import { fetchJobById } from "@/lib/jobs";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

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
  const [jobTitle, setJobTitle] = useState<string>("詳細");

  // Extract job ID from pathname and fetch job title from API
  // パス名から求人IDを抽出し、APIから求人タイトルを取得
  useEffect(() => {
    // Immediately reset jobTitle when pathname changes to avoid stale values in useMemo
    // pathname が変更されたらすぐに jobTitle をリセットして、useMemo での古い値の使用を回避
    if (pathname.startsWith("/jobs/")) {
      const jobId = pathname.split("/")[2];
      if (jobId) {
        // Reset to default immediately to ensure useMemo uses fresh value
        // useMemo が新しい値を使用するように、すぐにデフォルトにリセット
        setJobTitle("詳細");
        
        // Use AbortController to cancel previous requests when pathname changes
        // pathname が変更されたときに以前のリクエストをキャンセルするために AbortController を使用
        const abortController = new AbortController();
        let isCancelled = false;
        
        const fetchJobTitle = async () => {
          try {
            const job = await fetchJobById(jobId, "", abortController.signal);
            
            // Only update state if this effect hasn't been cancelled (pathname hasn't changed)
            // このエフェクトがキャンセルされていない場合（pathname が変更されていない場合）のみ状態を更新
            if (!isCancelled && pathname.startsWith("/jobs/") && pathname.split("/")[2] === jobId) {
              if (job?.title) {
                setJobTitle(job.title);
              } else {
                setJobTitle("詳細");
              }
            }
          } catch (error) {
            // Ignore AbortError - it's expected when navigating away quickly
            // AbortError は無視 - 素早くナビゲーションする際に期待される動作
            if (error instanceof Error && error.name === "AbortError") {
              return;
            }
            
            // Only update state if this effect hasn't been cancelled
            // このエフェクトがキャンセルされていない場合のみ状態を更新
            if (!isCancelled && pathname.startsWith("/jobs/") && pathname.split("/")[2] === jobId) {
              // Job not found or error, use default title
              // 求人が見つからないかエラーの場合、デフォルトタイトルを使用
              console.error("Failed to fetch job title:", error);
              setJobTitle("詳細");
            }
          }
        };

        fetchJobTitle();
        
        // Cleanup function to cancel the request if pathname changes or component unmounts
        // pathname が変更されたりコンポーネントがアンマウントされた場合にリクエストをキャンセルするクリーンアップ関数
        return () => {
          isCancelled = true;
          abortController.abort();
        };
      } else {
        setJobTitle("詳細");
      }
    } else {
      // Reset title when not on job detail page
      // 求人詳細ページ以外ではタイトルをリセット
      setJobTitle("詳細");
    }
  }, [pathname]);

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


