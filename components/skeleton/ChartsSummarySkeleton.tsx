/**
 * @file ChartsSummarySkeleton.tsx
 * @description Skeleton loading component for charts summary section
 * @description チャートサマリーセクションのスケルトンローディングコンポーネント
 * @author Virginia Zhang
 * @remarks Reusable skeleton component extracted from charts.tsx
 * @remarks charts.tsx から抽出された再利用可能なスケルトンコンポーネント
 */
"use client";

import Skeleton from "@/components/ui/skeleton";

/**
 * @description Skeleton data for loading states
 * @description ローディング状態用のスケルトンデータ
 */
const SKELETON_CONFIGS = {
  overall: { width: "h-56 w-56", className: "rounded-full" },
  score: { width: "h-6 w-16", className: "" },
  lines: [
    { width: "w-full" },
    { width: "w-11/12" },
    { width: "w-10/12" },
    { width: "w-9/12" },
    { width: "w-8/12" },
  ],
};

/**
 * @component ChartsSummarySkeleton
 * @description Skeleton loading component for charts summary section
 * @description チャートサマリーセクションのスケルトンローディングコンポーネント
 */
export default function ChartsSummarySkeleton(): React.ReactElement {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 text-center">マッチ度</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 border rounded-md">
          <h4 className="font-medium mb-3">全体スコア</h4>
          <div className="flex flex-col items-center">
            <Skeleton className={`${SKELETON_CONFIGS.overall.width} ${SKELETON_CONFIGS.overall.className}`} />
            <Skeleton className={`mt-4 ${SKELETON_CONFIGS.score.width}`} />
            <div className="mt-3 w-full space-y-2">
              {SKELETON_CONFIGS.lines.map((line, index) => (
                <Skeleton key={index} className={`h-4 ${line.width}`} />
              ))}
            </div>
          </div>
        </div>
        <div className="p-4 border rounded-md">
          <h4 className="font-medium mb-3">5次元スコア</h4>
          <div className="h-64 flex items-center justify-center">
            <Skeleton className="h-60 w-full" />
          </div>
          <div className="mt-3 p-3 rounded-md border bg-white/40 dark:bg-slate-900/30">
            <div className="text-sm text-muted-foreground">
              ヒント：頂点にホバー/タップしてください
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

