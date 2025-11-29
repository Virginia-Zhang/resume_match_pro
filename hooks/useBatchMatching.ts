/**
 * @file useBatchMatching.ts
 * @description Custom hook for batch matching with progressive results display
 * @description 段階的な結果表示を伴うバッチマッチング用カスタムフック
 * @author Virginia Zhang
 * @remarks Client-side hook for sequential batch processing with AI matching
 * @remarks AI マッチングを伴う順次バッチ処理用クライアントサイドフック
 */

"use client";

import { BATCH_SIZE } from "@/app/constants/constants";
import { useBatchMatchingMutation } from "@/hooks/queries/useMatch";
import { FriendlyErrorMessage, getFriendlyErrorMessage } from "@/lib/errorHandling";
import { serializeJDForBatchMatching } from "@/lib/jobs";
import {
  clearBatchMatchCache,
  loadBatchMatchCache,
  saveBatchMatchCache,
} from "@/lib/storage/batch-match-cache";
import type { JobDetailV2, JobListItem } from "@/types/jobs_v2";
import { useCallback, useEffect, useRef, useState } from "react";

import type { MatchResultItem, UseBatchMatchingResult } from "@/types/matching";

/**
 * @description Custom hook for batch matching with progressive results display
 * @description 段階的な結果表示を伴うバッチマッチング用カスタムフック
 * @param jobDetailsMap Map of job ID to JobDetailV2 for quick lookup
 * @param jobDetailsMap 高速検索用の求人IDからJobDetailV2へのMap
 * @param resumeId Current resume ID for cache key
 * @param resumeId キャッシュキー用の現在のレジュメID
 */
export function useBatchMatching(
  jobDetailsMap: Map<string, JobDetailV2>,
  resumeId?: string | null
): UseBatchMatchingResult {
  const [results, setResults] = useState<MatchResultItem[]>([]);
  const [isMatchingComplete, setIsMatchingComplete] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [errorInfo, setErrorInfo] = useState<FriendlyErrorMessage | null>(null);
  const [processedJobs, setProcessedJobs] = useState(0);
  const [totalJobs, setTotalJobs] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const batchMutation = useBatchMatchingMutation();

  // Use ref to always access latest results value
  // 最新の results 値に常にアクセスするために ref を使用
  const resultsRef = useRef<MatchResultItem[]>([]);

  // Keep resultsRef in sync with results
  // resultsRef を results と同期させる
  useEffect(() => {
    resultsRef.current = results;
  }, [results]);

  // Hydrate results from sessionStorage cache on mount
  // マウント時に sessionStorage キャッシュから結果をハイドレート
  // Only hydrate when results are empty to avoid overwriting in-progress matching
  // 進行中のマッチングを上書きしないよう、results が空の場合のみハイドレート
  useEffect(() => {
    if (!resumeId || results.length > 0) {
      return;
    }

    const cachedResults = loadBatchMatchCache(resumeId);
    if (cachedResults?.length) {
      setResults(cachedResults);
      setIsMatchingComplete(true);
      setProcessedJobs(cachedResults.length);
      setTotalJobs(prev => (prev === 0 ? cachedResults.length : prev));
    }
  }, [resumeId, results.length]);

  // Persist results to sessionStorage (debounced)
  // 結果を sessionStorage に永続化（デバウンス済み）
  useEffect(() => {
    if (!resumeId || results.length === 0) {
      return;
    }

    const handle = setTimeout(() => {
      saveBatchMatchCache(resumeId, results);
    }, 250);

    return () => clearTimeout(handle);
  }, [results, resumeId]);

  /**
   * @description Cancel ongoing requests when component unmounts
   * @description コンポーネントのアンマウント時に進行中のリクエストをキャンセル
   */
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * @description Split array into chunks
   * @description 配列をチャンクに分割
   */
  const chunkArray = <T,>(array: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  };

  /**
   * @description Internal batch matching process
   * @description 内部バッチマッチング処理
   * @param resumeText - Resume text for matching
   * @param resumeText マッチング用のレジュメテキスト
   * @param jobs - Jobs to match
   * @param jobs マッチングする求人
   * @param incremental - Whether to merge new results with existing ones
   * @param incremental 新しい結果を既存の結果とマージするかどうか
   */
  const startMatchingInternal = useCallback(
    async (
      resumeText: string,
      jobs: JobDetailV2[],
      incremental: boolean = false,
      existingResults: MatchResultItem[] = []
    ) => {
      // Split jobs into batches
      // ジョブをバッチに分割
      const batches = chunkArray(jobs, BATCH_SIZE);

      try {
        const accumulatedResults: MatchResultItem[] = incremental
          ? [...existingResults]
          : [];

        // Process each batch sequentially
        // 各バッチを順次処理
        for (let i = 0; i < batches.length; i++) {
          try {
            // Serialize JobDetailV2 objects to optimized text for AI analysis
            // JobDetailV2 オブジェクトをAI分析用の最適化テキストにシリアライズ
            const serializedJobs = batches[i].map(job => ({
              id: job.id,
              job_description: serializeJDForBatchMatching(job),
            }));

            const batchData = await batchMutation.mutateAsync({
              resume_text: resumeText,
              jobs: serializedJobs,
              requestOptions: {
                signal: abortControllerRef.current?.signal || undefined,
              },
            });

            if (
              batchData.match_results &&
              Array.isArray(batchData.match_results)
            ) {
              // Merge new results with existing ones (avoid duplicates)
              // 新しい結果を既存の結果とマージ（重複を避ける）
              const newResults = batchData.match_results.filter(
                newResult =>
                  !accumulatedResults.some(
                    existing => existing.job_id === newResult.job_id
                  )
              );

              accumulatedResults.push(...newResults);
              // Update state immediately after each batch to ensure all results are captured
              // 各バッチ後に即座に状態を更新し、すべての結果が確実にキャプチャされるようにする
              setResults([...accumulatedResults]);
              setProcessedJobs(accumulatedResults.length);
            }
          } catch (batchError) {
            if (
              batchError instanceof Error &&
              batchError.name === "AbortError"
            ) {
              return;
            }
            console.error(`Batch ${i + 1} failed:`, batchError);
            continue;
          }
        }

        // Ensure final state is set after all batches complete
        // すべてのバッチ完了後に最終状態が確実に設定されるようにする
        setResults([...accumulatedResults]);
        setProcessedJobs(accumulatedResults.length);

        setIsMatchingComplete(true);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        const friendlyError = getFriendlyErrorMessage(error);
        setErrorInfo(friendlyError);
        console.error("Matching process error:", error);
      } finally {
        setIsMatching(false);
      }
    },
    [batchMutation]
  );

  /**
   * @description Start batch matching process from JobListItem array
   * @description JobListItem 配列からバッチマッチング処理を開始
   * @param resumeText - Resume text for matching
   * @param resumeText マッチング用のレジュメテキスト
   * @param jobListItems - List of jobs to match
   * @param jobListItems マッチングする求人のリスト
   * @param incremental - Whether to merge new results with existing ones (default: false)
   * @param incremental 新しい結果を既存の結果とマージするかどうか（デフォルト：false）
   * @param totalJobsCount - Total number of jobs (for incremental mode, includes already analyzed jobs)
   * @param totalJobsCount 求人の総数（インクリメンタルモードの場合、すでに分析された求人を含む）
   */
  const startMatchingFromListItems = useCallback(
    async (
      resumeText: string,
      jobListItems: JobListItem[],
      incremental: boolean = false,
      totalJobsCount?: number
    ) => {
      // Reset state only if not incremental matching
      // インクリメンタルマッチングでない場合のみ状態をリセット
      if (!incremental) {
        setResults([]);
        setIsMatchingComplete(false);
        setProcessedJobs(0);
        setTotalJobs(0);
        clearBatchMatchCache();
      }

      setIsMatching(true);
      setErrorInfo(null);
      // Use totalJobsCount if provided (for incremental mode), otherwise use jobListItems.length
      // totalJobsCountが提供されている場合（インクリメンタルモード）、それを使用、そうでなければjobListItems.lengthを使用
      setTotalJobs(totalJobsCount ?? jobListItems.length);

      // For incremental mode, set processedJobs to the number of already analyzed jobs
      // インクリメンタルモードの場合、processedJobs をすでに分析された求人の数に設定
      if (incremental && totalJobsCount !== undefined) {
        const alreadyProcessed = totalJobsCount - jobListItems.length;
        setProcessedJobs(alreadyProcessed);
      }

      // Create new AbortController for this matching session
      // このマッチングセッション用の新しい AbortController を作成
      abortControllerRef.current = new AbortController();

      try {
        // Get full job details for each JobListItem from the provided map
        // 提供されたMapから各JobListItemの完全な求人詳細を取得
        const jobDetails: JobDetailV2[] = [];

        for (const jobItem of jobListItems) {
          const jobDetail = jobDetailsMap.get(jobItem.id);
          if (jobDetail) {
            jobDetails.push(jobDetail);
          } else {
            console.warn(`Job not found in map: ${jobItem.id}`);
          }
        }

        if (jobDetails.length === 0) {
          throw new Error("No job details could be found");
        }

        // Start matching with full job details (incremental mode)
        // 完全な求人詳細でマッチングを開始（インクリメンタルモード）
        await startMatchingInternal(
          resumeText,
          jobDetails,
          incremental,
          resultsRef.current
        );
      } catch (error) {
        // Check if it was aborted
        // 中断されたかチェック
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        const friendlyError = getFriendlyErrorMessage(error);
        setErrorInfo(friendlyError);
        console.error("Matching process error:", error);
      } finally {
        setIsMatching(false);
      }
    },
    [jobDetailsMap, startMatchingInternal]
  );

  return {
    results,
    isMatchingComplete,
    isMatching,
    errorInfo,
    processedJobs,
    totalJobs,
    startMatchingFromListItems,
  };
}
