/**
 * @file JobDetailSkeleton.tsx
 * @description Skeleton loading component for job detail page
 * @description 求人詳細ページのスケルトンローディングコンポーネント
 * @author Virginia Zhang
 * @remarks Reusable skeleton component extracted from JobDetailClient
 * @remarks JobDetailClient から抽出された再利用可能なスケルトンコンポーネント
 */
"use client";

import Skeleton from "@/components/ui/skeleton";

/**
 * @component JobDetailSkeleton
 * @description Skeleton loading component for job detail page
 * @description 求人詳細ページのスケルトンローディングコンポーネント
 */
export default function JobDetailSkeleton(): React.ReactElement {
  return (
    <div className="mx-auto max-w-4xl 2xl:max-w-[75vw] p-6 space-y-8">
      {/* Header Skeleton */}
      <header className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
          <div className="mt-2 flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-14" />
            ))}
          </div>
        </div>
      </header>

      {/* Description Sections Skeleton */}
      {Array.from({ length: 2 }).map((_, sectionIndex) => (
        <section key={sectionIndex} className="space-y-2">
          <Skeleton className="h-5 w-20" />
          <div className="space-y-2">
            {Array.from({ length: sectionIndex === 0 ? 5 : 3 }).map((_, i) => (
              <Skeleton 
                key={i} 
                className={`h-4 ${i === 0 ? 'w-full' : `w-${11 - i}/12`}`}
              />
            ))}
          </div>
        </section>
      ))}

      {/* Employment Info Skeleton */}
      <section className="space-y-2">
        <Skeleton className="h-5 w-24" />
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-7/12" />
          ))}
        </div>
      </section>

      {/* Requirements Skeleton */}
      <section className="space-y-2">
        <Skeleton className="h-5 w-16" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton 
              key={i} 
              className={`h-4 w-${10 - i}/12`}
            />
          ))}
        </div>
      </section>

      {/* Charts Section Skeleton */}
      <section className="space-y-6">
        <div className="text-center">
          <Skeleton className="h-7 w-64 mx-auto" />
          <Skeleton className="h-4 w-80 mx-auto mt-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-80 w-full" />
          ))}
        </div>
      </section>
    </div>
  );
}
