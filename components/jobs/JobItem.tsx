/**
 * @file JobItem.tsx
 * @description Individual job item component with match result display
 * @description マッチ結果表示付きの個別求人アイテムコンポーネント
 * @author Virginia Zhang
 * @remarks Reusable job item component for both desktop and mobile layouts
 * @remarks デスクトップとモバイルレイアウト両方で再利用可能な求人アイテムコンポーネント
 */

import Image from 'next/image';
import Link from 'next/link';
import { Star, StarHalf } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import MatchResultSkeleton from '@/components/skeleton/MatchResultSkeleton';

import type { JobListItem } from '@/types/jobs_v2';
import type { MatchResultItem, RecommendationLevel } from '@/types/matching';

interface JobItemProps {
  /**
   * Job data to display
   * 表示する求人データ
   */
  job: JobListItem;
  /**
   * Match result for this job (if available)
   * この求人のマッチ結果（利用可能な場合）
   */
  matchResult: MatchResultItem | null;
  /**
   * Whether this job is currently being analyzed
   * この求人が現在分析中かどうか
   */
  isLoading: boolean;
  /**
   * Base URL for job details
   * 求人詳細のベースURL
   */
  jobUrl: string;
}

/**
 * @description Compact relative time (weeks) for job postedAt
 * @description 求人の掲載からの経過時間（週）を簡易表示
 */
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const weeks = Math.floor(diff / (7 * 24 * 3600 * 1000));
  return `${weeks} 週間前`;
}

/**
 * @description Get star rating from overall score (0.5 to 5.0)
 * @description 総合スコアから星評価を取得（0.5～5.0）
 */
function getStarRating(overall: number): number {
  if (overall >= 85) return 5.0;
  if (overall >= 75) return 4.5;
  if (overall >= 65) return 4.0;
  if (overall >= 55) return 3.5;
  if (overall >= 45) return 3.0;
  if (overall >= 35) return 2.5;
  if (overall >= 25) return 2.0;
  if (overall >= 15) return 1.5;
  if (overall >= 5) return 1.0;
  return 0.5;
}

/**
 * @description Get recommendation level from overall score
 * @description 総合スコアから推薦レベルを取得
 */
function getRecommendationLevel(overall: number): RecommendationLevel {
  if (overall >= 80) return "高い";
  if (overall >= 60) return "中程度";
  return "低い";
}

/**
 * @description Render star rating component
 * @description 星評価コンポーネントをレンダリング
 */
function StarRating({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star key={`full-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      ))}
      {hasHalfStar && <StarHalf className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
      ))}
    </div>
  );
}

/**
 * @component JobItem
 * @description Individual job item component with match result display
 * @description マッチ結果表示付きの個別求人アイテムコンポーネント
 * @param {JobItemProps} props - Component props
 * @param {JobItemProps} props コンポーネントのプロパティ
 * @param {JobListItem} props.job - Job data to display
 * @param {JobListItem} props.job 表示する求人データ
 * @param {MatchResultItem | null} props.matchResult - Match result for this job
 * @param {MatchResultItem | null} props.matchResult この求人のマッチ結果
 * @param {boolean} props.isLoading - Whether this job is currently being analyzed
 * @param {boolean} props.isLoading この求人が現在分析中かどうか
 * @param {string} props.jobUrl - Base URL for job details
 * @param {string} props.jobUrl 求人詳細のベースURL
 * @returns {JSX.Element} Job item component
 * @returns {JSX.Element} 求人アイテムコンポーネント
 * @remarks Displays job information with responsive match result layout
 * @remarks レスポンシブなマッチ結果レイアウトで求人情報を表示
 */
export default function JobItem({ job, matchResult, isLoading, jobUrl }: JobItemProps) {
  return (
    <li className="py-4 px-2">
      {/* Main Job Content */}
      {/* メイン求人コンテンツ */}
      <Link 
        href={{
          pathname: jobUrl,
          query: matchResult ? { matchResult: JSON.stringify(matchResult) } : {}
        }}
        className="flex items-center gap-4 hover:bg-accent/50 transition-colors cursor-pointer rounded-lg p-2"
      >
        <Image
          src={job.logoUrl}
          alt={job.company}
          width={40}
          height={40}
          className="h-10 w-10 rounded shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-medium truncate">{job.title}</h2>
            {job.tags.map(tag => (
              <Badge variant="tertiary" className="text-xs" key={tag}>
                {tag}
              </Badge>
            ))}
            {job.recruitFromOverseas && (
              <Badge variant="default" className="text-xs">
                海外応募可
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {job.company} ・ {job.location}
          </p>
          <p className="text-xs text-muted-foreground">
            {timeAgo(job.postedAt)}
          </p>
        </div>
        
        {/* Match Result Display - Desktop Only */}
        {/* マッチング結果表示 - デスクトップのみ */}
        <div className="hidden sm:block">
          {matchResult ? (
            <div className="flex flex-col items-end gap-2 shrink-0">
              <StarRating rating={getStarRating(matchResult.overall)} />
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {matchResult.overall.toFixed(1)}%
                </span>
                <Badge 
                  variant={matchResult.overall >= 80 ? "default" : matchResult.overall >= 60 ? "secondary" : "outline"}
                  className="text-xs"
                >
                  {getRecommendationLevel(matchResult.overall)}
                </Badge>
              </div>
            </div>
          ) : isLoading ? (
            <MatchResultSkeleton variant="desktop" />
          ) : null}
        </div>
      </Link>
      
      {/* Match Result Display - Mobile Only */}
      {/* マッチング結果表示 - モバイルのみ */}
      {(matchResult || isLoading) && (
        <div className="sm:hidden mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          {matchResult ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StarRating rating={getStarRating(matchResult.overall)} />
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {matchResult.overall.toFixed(1)}%
                </span>
              </div>
              <Badge 
                variant={matchResult.overall >= 80 ? "default" : matchResult.overall >= 60 ? "secondary" : "outline"}
                className="text-xs"
              >
                {getRecommendationLevel(matchResult.overall)}
              </Badge>
            </div>
          ) : isLoading ? (
            <MatchResultSkeleton variant="mobile" />
          ) : null}
        </div>
      )}
    </li>
  );
}
