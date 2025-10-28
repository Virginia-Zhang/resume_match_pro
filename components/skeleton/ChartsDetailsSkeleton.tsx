/**
 * @file ChartsDetailsSkeleton.tsx
 * @description Skeleton loading component for charts details section
 * @description チャート詳細セクションのスケルトンローディングコンポーネント
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
  advantages: [
    { width: "w-10/12" },
    { width: "w-9/12" },
    { width: "w-8/12" },
  ],
  disadvantages: [
    { width: "w-10/12" },
    { width: "w-9/12" },
  ],
  advice: [
    { width: "w-11/12" },
    { width: "w-10/12" },
    { width: "w-9/12" },
  ],
};

/**
 * @component ChartsDetailsSkeleton
 * @description Skeleton loading component for charts details section
 * @description チャート詳細セクションのスケルトンローディングコンポーネント
 */
export default function ChartsDetailsSkeleton(): React.ReactElement {
  return (
    <div>
      {/* Overview skeleton section */}
      {/* 概要のスケルトンセクション */}
      <div className="my-6 p-4 border rounded-md bg-gray-50 dark:bg-gray-900/50">
        <h4 className="font-medium mb-3">分析概要</h4>
        <div className="text-sm text-muted-foreground">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-4 mb-2 w-full" />
          ))}
        </div>
      </div>
      {/* Advice skeleton section */}
      {/* 面接アドバイスのスケルトンセクション */}
      <h3 className="text-lg font-semibold mb-4 text-center">
        面接アドバイス
      </h3>
      <div className="p-4 border rounded-md">
        <div className="space-y-6 text-sm">
          <section>
            <h4 className="font-medium mb-3">強み</h4>
            <div className="space-y-2">
              {SKELETON_CONFIGS.advantages.map((line, index) => (
                <Skeleton key={index} className={`h-4 ${line.width}`} />
              ))}
            </div>
          </section>
          <section>
            <h4 className="font-medium mb-3">弱み</h4>
            <div className="space-y-2">
              {SKELETON_CONFIGS.disadvantages.map((line, index) => (
                <Skeleton key={index} className={`h-4 ${line.width}`} />
              ))}
            </div>
          </section>
          <section>
            <h4 className="font-medium mb-3">面接対策</h4>
            <div className="space-y-2">
              {SKELETON_CONFIGS.advice.map((line, index) => (
                <Skeleton key={index} className={`h-4 ${line.width}`} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

