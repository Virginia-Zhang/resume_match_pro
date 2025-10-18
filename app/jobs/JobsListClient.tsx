/**
 * @file JobsListClient.tsx
 * @description Client component for jobs list with AI matching functionality
 * @description AI マッチング機能付きの求人一覧クライアントコンポーネント
 * @author Virginia Zhang
 * @remarks Client component that handles job filtering, AI matching, and result display
 * @remarks 求人フィルタリング、AI マッチング、結果表示を処理するクライアントコンポーネント
 */

"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, StarHalf } from 'lucide-react';
import { useBatchMatching } from './useBatchMatching';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import ErrorDisplay from '@/components/common/ErrorDisplay';
import { ROUTE_JOBS, API_RESUME_TEXT } from '@/app/constants/constants';
import { getApiBase } from '@/lib/runtime-config';
import { fetchJson } from '@/lib/fetcher';

import type { JobListItem } from '@/types/jobs_v2';
import type { MatchResultItem, RecommendationLevel } from '@/types/matching';
import { toast } from "sonner"
import { PrimaryCtaButton } from '@/components/common/buttons/CtaButtons';

interface JobsListClientProps {
  initialJobs: JobListItem[];
  resumeId?: string;
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
 * @component JobsListClient
 * @description Client component for jobs list with AI matching
 * @description AI マッチング付きの求人一覧クライアントコンポーネント
 */
export default function JobsListClient({ initialJobs, resumeId }: JobsListClientProps) {
  const {
    results,
    isMatchingComplete,
    isMatching,
    errorInfo,
    processedJobs,
    totalJobs,
    startMatchingFromListItems
  } = useBatchMatching();
  
  const [jobs, setJobs] = useState<JobListItem[]>(initialJobs);
  const [hasStartedMatching, setHasStartedMatching] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [isLoadingResume, setIsLoadingResume] = useState(true);
  
  /**
   * @description Calculate progress percentage
   * @description 進捗率を計算
   */
  const progressPercent = totalJobs > 0 ? Math.round((processedJobs / totalJobs) * 100) : 0;
  
  /**
   * @description Load resume text on component mount using provided resumeId
   * @description 提供された resumeId を使用してコンポーネントマウント時にレジュメテキストを読み込み
   */
  useEffect(() => {
    const loadResumeText = async () => {
      if (!resumeId) {
        console.warn('No resume ID provided');
        setIsLoadingResume(false);
        return;
      }

      try {
        // Get resume text from S3 by resume ID
        // レジュメIDによってS3からレジュメテキストを取得
        const getResumeTextApi = `${getApiBase()}${API_RESUME_TEXT}?resumeId=${encodeURIComponent(resumeId)}`;
        const data = await fetchJson<{ resumeText: string }>(getResumeTextApi);
        
        if (data?.resumeText) {
          setResumeText(data.resumeText);
          console.log('✅ Resume text loaded successfully');
        } else {
          console.warn('No resume text found');
        }
      } catch (error) {
        console.error('❌ Failed to load resume text:', error);
      } finally {
        setIsLoadingResume(false);
      }
    };
    
    loadResumeText();
  }, [resumeId]);
  
  /**
   * @description Handle AI matching start
   * @description AI マッチング開始処理
   */
  const handleStartMatching = () => {
    if (jobs.length === 0) {
      toast.error('求人が見つかりません');
      return;
    }
    if (!resumeText.trim()) {
      toast.error('レジュメテキストが読み込まれていません。まずレジュメをアップロードしてください。');
      return;
    }
    
    setHasStartedMatching(true);
    console.log(`🚀 Starting matching with ${jobs.length} jobs`);
    startMatchingFromListItems(resumeText, jobs);
  };
  
  /**
   * @description Get match result for a specific job
   * @description 特定の求人のマッチ結果を取得
   */
  const getMatchResult = (jobId: string): MatchResultItem | null => {
    return results.find(r => r.job_id === jobId) || null;
  };
  
  return (
    <div className="mx-auto max-w-4xl 2xl:max-w-[75vw] p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">求人一覧</h1>
        
        {/* AI Matching Button */}
        {/* AI マッチングボタン */}
        <PrimaryCtaButton
          onClick={handleStartMatching}
          disabled={isMatching || jobs.length === 0 || isLoadingResume || !resumeText.trim()}
        >
          {isLoadingResume ? 'レジュメ読み込み中...' : isMatching ? '分析中...' : 'AIマッチング'}
        </PrimaryCtaButton>
      </div>
      
      {/* Progress Display (shown during matching) */}
      {/* 進捗表示（マッチング中に表示） */}
      {isMatching && (
        <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              AIマッチング分析中...
            </span>
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
              {progressPercent}%
            </span>
          </div>
          
          <Progress value={progressPercent} className="h-2 mb-2" />
          
          <div className="text-xs text-blue-600 dark:text-blue-400">
            分析済み: {processedJobs}/{totalJobs} 件
          </div>
        </div>
      )}
      
      {/* Completion Message (shown after matching completes) */}
      {/* 完了メッセージ（マッチング完了後に表示） */}
      {isMatchingComplete && results.length > 0 && (
        <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
          <div className="text-sm text-green-700 dark:text-green-300">
            ✅ AIマッチング分析が完了しました。{results.length} 件の求人を分析しました。
          </div>
        </div>
      )}
      
      {/* Error Display */}
      {/* エラー表示 */}
      {errorInfo && (
        <ErrorDisplay
          title="マッチング分析エラー"
          errorInfo={errorInfo}
        />
      )}
      
      {/* Job List */}
      {/* 求人一覧 */}
      <ul className="divide-y">
        {jobs.map(job => {
          const matchResult = getMatchResult(job.id);
          const isLoading = isMatching && !matchResult;
          const jobUrl = `${ROUTE_JOBS}/${encodeURIComponent(job.id)}`;
          
          return (
            <li key={job.id}>
              <Link 
                href={{
                  pathname: jobUrl,
                  query: matchResult ? { matchResult: JSON.stringify(matchResult) } : {}
                }}
                className="py-4 flex items-center gap-4 hover:bg-accent/50 transition-colors cursor-pointer rounded-lg px-2"
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
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {job.company} ・ {job.location}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {timeAgo(job.postedAt)}
                  </p>
                </div>
                
                {/* Match Result Display */}
                {/* マッチング結果表示 */}
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
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-gray-300" />
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                  </div>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
