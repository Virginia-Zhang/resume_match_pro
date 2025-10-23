/**
 * @file JobsListClient.tsx
 * @description Client component for jobs list with AI matching functionality
 * @description AI マッチング機能付きの求人一覧クライアントコンポーネント
 * @author Virginia Zhang
 * @remarks Client component that handles job filtering, AI matching, and result display
 * @remarks 求人フィルタリング、AI マッチング、結果表示を処理するクライアントコンポーネント
 */

"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useBatchMatching } from './useBatchMatching';
import { Progress } from '@/components/ui/progress';
import ErrorDisplay from '@/components/common/ErrorDisplay';
import { ROUTE_JOBS, API_RESUME_TEXT } from '@/app/constants/constants';
import { getApiBase } from '@/lib/runtime-config';
import { fetchJson } from '@/lib/fetcher';
import JobFilters from '@/components/jobs/JobFilters';
import JobItem from '@/components/jobs/JobItem';

import type { JobListItem } from '@/types/jobs_v2';
import type { MatchResultItem } from '@/types/matching';
import { toast } from "sonner"

interface JobsListClientProps {
  initialJobs: JobListItem[];
  resumeId?: string;
}

/**
 * @component JobsListClient
 * @description Client component for jobs list with AI matching
 * @description AI マッチング付きの求人一覧クライアントコンポーネント
 */
export default function JobsListClient({ initialJobs, resumeId }: JobsListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const {
    results,
    isMatchingComplete,
    isMatching,
    errorInfo,
    processedJobs,
    totalJobs,
    startMatchingFromListItems
  } = useBatchMatching();
  
  // Initialize filter states from URL params
  // URL パラメータからフィルター状態を初期化
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const categoriesParam = searchParams.get('categories');
    return categoriesParam ? categoriesParam.split(',') : [];
  });
  const [selectedResidence, setSelectedResidence] = useState<string>(() => {
    return searchParams.get('residence') || '';
  });
  const [selectedLocations, setSelectedLocations] = useState<string[]>(() => {
    const locationsParam = searchParams.get('locations');
    return locationsParam ? locationsParam.split(',') : [];
  });
  
  const [jobs, setJobs] = useState<JobListItem[]>(initialJobs);
  const [hasStartedMatching, setHasStartedMatching] = useState(false);
  const [resumeText, setResumeText] = useState('');
  // Track if filters have changed since last matching
  // 最後のマッチング以降にフィルターが変更されたかを追跡
  const [filtersChanged, setFiltersChanged] = useState(false);
  
  /**
   * @description Filter jobs based on selected filters
   * @description 選択されたフィルターに基づいて求人をフィルタリング
   */
  const filteredJobs = useMemo(() => {
    let filtered = [...initialJobs];

    // Filter by category (tags must include any selected category)
    // 職種でフィルタリング（タグに選択された職種が含まれている必要がある）
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(job => 
        job.tags.some(tag => selectedCategories.includes(tag))
      );
    }

    // Filter by residence (recruitFromOverseas)
    // お住まいでフィルタリング（recruitFromOverseas）
    if (selectedResidence === 'overseas') {
      filtered = filtered.filter(job => job.recruitFromOverseas === true);
    }
    // If residence is "japan", no filtering needed
    // お住まいが「japan」の場合、フィルタリング不要

    // Filter by work location
    // 勤務地でフィルタリング
    if (selectedLocations.length > 0 && selectedLocations.length < 2) {
      if (selectedLocations.includes('tokyo') && !selectedLocations.includes('other')) {
        filtered = filtered.filter(job => job.location === '東京都');
      } else if (selectedLocations.includes('other') && !selectedLocations.includes('tokyo')) {
        filtered = filtered.filter(job => job.location !== '東京都');
      }
      // If both are selected, no filtering needed
      // 両方が選択されている場合、フィルタリング不要
    }

    return filtered;
  }, [initialJobs, selectedCategories, selectedResidence, selectedLocations]);
  
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
      }
    };
    
    loadResumeText();
  }, [resumeId]);
  
  /**
   * @description Handle AI matching start with filtered jobs
   * @description フィルターされた求人でAIマッチングを開始
   */
  const handleStartMatching = () => {
    if (filteredJobs.length === 0) {
      toast.error('フィルター条件に合う求人が見つかりません');
      return;
    }
    if (!resumeText.trim()) {
      toast.error('レジュメテキストが読み込まれていません。まずレジュメをアップロードしてください。');
      return;
    }
    
    setHasStartedMatching(true);
    setFiltersChanged(false); // Reset filter change flag when starting new matching
    
    // Filter out jobs that have already been analyzed
    // すでに分析された求人をフィルターで除外
    const alreadyAnalyzedJobIds = new Set(results.map(r => r.job_id));
    const jobsToMatch = filteredJobs.filter(job => !alreadyAnalyzedJobIds.has(job.id));
    
    // Check if all jobs have already been analyzed
    // すべての求人がすでに分析されているかチェック
    if (jobsToMatch.length === 0) {
      toast.info('すべての求人は既に分析済みです。');
      // Don't reset hasStartedMatching to false, keep it true so sorted jobs are displayed
      // hasStartedMatching を false にリセットしない、ソートされた求人が表示されるように true のままにする
      return;
    }
    
    const incremental = jobsToMatch.length < filteredJobs.length;
    
    if (incremental) {
      console.log(`🚀 Starting incremental matching: ${jobsToMatch.length} new jobs (${alreadyAnalyzedJobIds.size} already analyzed)`);
      toast.info(`${processedJobs} 件の求人は既に分析済みです。新しい ${jobsToMatch.length} 件のみを分析します。`);
      // Pass total number of filtered jobs (including already analyzed ones)
      // フィルターされた求人の総数（すでに分析されたものを含む）を渡す
      startMatchingFromListItems(resumeText, jobsToMatch, incremental, filteredJobs.length);
    } else {
      console.log(`🚀 Starting matching with ${filteredJobs.length} jobs`);
      startMatchingFromListItems(resumeText, jobsToMatch, incremental);
    }
  };

  /**
   * @description Track filter changes
   * @description フィルター変更を追跡
   */
  useEffect(() => {
    // Mark filters as changed when any filter value changes
    // フィルター値が変更されたときにフィルターが変更されたことをマーク
    setFiltersChanged(true);
  }, [selectedCategories, selectedResidence, selectedLocations]);

  /**
   * @description Update URL query params when filters change
   * @description フィルター変更時に URL クエリパラメータを更新
   */
  useEffect(() => {
    const params = new URLSearchParams();
    
    // Preserve resumeId if it exists
    // resumeId が存在する場合は保持
    if (resumeId) {
      params.set('resumeId', resumeId);
    }
    
    // Add filter params
    // フィルターパラメータを追加
    if (selectedCategories.length > 0) {
      params.set('categories', selectedCategories.join(','));
    }
    if (selectedResidence) {
      params.set('residence', selectedResidence);
    }
    if (selectedLocations.length > 0) {
      params.set('locations', selectedLocations.join(','));
    }
    
    // Update URL without triggering navigation
    // ナビゲーションをトリガーせずに URL を更新
    const newUrl = `${ROUTE_JOBS}${params.toString() ? `?${params.toString()}` : ''}`;
    router.replace(newUrl, { scroll: false });
  }, [selectedCategories, selectedResidence, selectedLocations, resumeId, router]);

  /**
   * @description Update displayed jobs when filters change or matching completes
   * @description フィルター変更時またはマッチング完了時に表示する求人を更新
   */
  useEffect(() => {
    // If matching is complete, show all filtered jobs sorted by overall score
    // マッチングが完了している場合、すべてのフィルターされた求人を総合スコアでソートして表示
    if (isMatchingComplete && results.length > 0) {
      // Auto-set hasStartedMatching to true when we have match results
      // マッチ結果がある場合、hasStartedMatching を自動的に true に設定
      if (!hasStartedMatching) {
        setHasStartedMatching(true);
      }
      
      // Sort all filtered jobs by overall score in descending order
      // すべてのフィルターされた求人を総合スコアで降順ソート
      // Jobs without match results will have score 0 and appear at the end
      // マッチ結果がない求人はスコア0となり、最後に表示される
      const sortedJobs = [...filteredJobs].sort((a, b) => {
        const scoreA = results.find(r => r.job_id === a.id)?.overall || 0;
        const scoreB = results.find(r => r.job_id === b.id)?.overall || 0;
        return scoreB - scoreA; // Descending order / 降順
      });
      
      setJobs(sortedJobs);
    } else if (!isMatching) {
      // If not matching, show filtered jobs without sorting
      // マッチングしていない場合、ソートなしでフィルターされた求人を表示
      setJobs(filteredJobs);
    }
  }, [filteredJobs, isMatchingComplete, isMatching, results, hasStartedMatching]);
  
  /**
   * @description Get match result for a specific job
   * @description 特定の求人のマッチ結果を取得
   */
  const getMatchResult = (jobId: string): MatchResultItem | null => {
    return results.find(r => r.job_id === jobId) || null;
  };

  
  
  return (
    <div className="mx-auto max-w-4xl 2xl:max-w-[75vw] p-6 space-y-6">
      {/* Job Filters */}
      {/* 求人フィルター */}
      <JobFilters
        selectedCategories={selectedCategories}
        onCategoriesChange={setSelectedCategories}
        selectedResidence={selectedResidence}
        onResidenceChange={setSelectedResidence}
        selectedLocations={selectedLocations}
        onLocationsChange={setSelectedLocations}
        onMatch={handleStartMatching}
        isMatching={isMatching}
      />

      {/* Match Count Display */}
      {/* マッチ数表示 */}
      {(selectedCategories.length > 0 || selectedResidence || selectedLocations.length > 0) && (
        <div className="text-sm text-muted-foreground">
          {filteredJobs.length} 件の適合する求人が見つかりました
      </div>
      )}
      
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
      
      {/* Completion Message (shown only when no filter changes since last matching) */}
      {/* 完了メッセージ（最後のマッチング以降にフィルターが変更されていない場合のみ表示） */}
      {isMatchingComplete && !filtersChanged && !isMatching && (
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
        {(hasStartedMatching && isMatchingComplete ? jobs : filteredJobs).map((job) => {
          const matchResult = getMatchResult(job.id);
          const isLoading = isMatching && !matchResult;
          const jobUrl = `${ROUTE_JOBS}/${encodeURIComponent(job.id)}`;
          
          return (
            <JobItem
              key={job.id}
              job={job}
              matchResult={matchResult}
              isLoading={isLoading}
              jobUrl={jobUrl}
            />
          );
        })}
      </ul>
    </div>
  );
}
