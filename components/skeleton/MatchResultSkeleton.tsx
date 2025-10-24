/**
 * @file MatchResultSkeleton.tsx
 * @description Skeleton component for match result display during loading
 * @description マッチング結果表示用のスケルトンコンポーネント
 * @author Virginia Zhang
 * @remarks Reusable skeleton component for both desktop and mobile layouts
 * @remarks デスクトップとモバイルレイアウト両方で再利用可能なスケルトンコンポーネント
 */

import { Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface MatchResultSkeletonProps {
  /**
   * Layout variant for the skeleton
   * スケルトンのレイアウトバリアント
   */
  variant: 'desktop' | 'mobile';
}

/**
 * @component MatchResultSkeleton
 * @description Skeleton component for match result display
 * @description マッチング結果表示用のスケルトンコンポーネント
 * @param {MatchResultSkeletonProps} props - Component props
 * @param {MatchResultSkeletonProps} props コンポーネントのプロパティ
 * @param {'desktop' | 'mobile'} props.variant - Layout variant
 * @param {'desktop' | 'mobile'} props.variant レイアウトバリアント
 * @returns {JSX.Element} Skeleton component
 * @returns {JSX.Element} スケルトンコンポーネント
 * @remarks Displays loading state for match results with star rating and recommendation level
 * @remarks 星評価と推薦レベルを含むマッチ結果のローディング状態を表示
 */
export default function MatchResultSkeleton({ variant }: MatchResultSkeletonProps) {
  if (variant === 'desktop') {
    return (
      <div className="flex flex-col items-end gap-2 shrink-0">
        {/* Star Rating Skeleton */}
        {/* 星評価スケルトン */}
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-4 w-4 text-gray-300" />
          ))}
        </div>
        
        {/* Percentage and Badge Skeleton */}
        {/* パーセンテージとバッジスケルトン */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-5 w-16" />
        </div>
      </div>
    );
  }

  // Mobile variant
  // モバイルバリアント
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {/* Star Rating Skeleton */}
        {/* 星評価スケルトン */}
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-4 w-4 text-gray-300" />
          ))}
        </div>
        <Skeleton className="h-4 w-12" />
      </div>
      <Skeleton className="h-5 w-16" />
    </div>
  );
}
