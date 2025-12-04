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
import { useBatchCacheQuery, useBatchMatchingMutation } from "@/hooks/queries/useMatch";
import { FriendlyErrorMessage, getFriendlyErrorMessage } from "@/lib/errorHandling";
import { serializeJDForBatchMatching } from "@/lib/jobs";
import {
  clearBatchMatchMetadata,
  loadBatchMatchMetadata,
  saveBatchMatchMetadata,
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

  // Track previous resumeId to detect changes
  // 前回の resumeId を追跡して変更を検出
  const prevResumeIdRef = useRef<string | null | undefined>(resumeId);

  // Track if initial data has been hydrated to prevent saving initial values
  // 初期データがハイドレートされたかを追跡し、初期値の保存を防ぐ
  const isHydratedRef = useRef(false);

  // Track if user has actively started matching (to enable metadata saving)
  // ユーザーがアクティブにマッチングを開始したかを追跡（メタデータ保存を有効化）
  const hasStartedMatchingRef = useRef(false);

  // Fetch cached results from database using TanStack Query
  // TanStack Query を使用してデータベースからキャッシュ結果を取得
  const { data: cacheData } = useBatchCacheQuery(resumeId, {
    enabled: Boolean(resumeId) && !isMatching,
    staleTime: 0, // Always refetch on mount to capture single match updates
  });

  // Keep resultsRef in sync with results
  // resultsRef を results と同期させる
  useEffect(() => {
    resultsRef.current = results;
  }, [results]);

  // Clear results when resumeId changes to prevent cache corruption
  // resumeId 変更時に結果をクリアしてキャッシュ破損を防止
  useEffect(() => {
    // Skip on initial mount (when prevResumeIdRef is undefined)
    // 初回マウント時はスキップ（prevResumeIdRef が undefined の場合）
    if (prevResumeIdRef.current === undefined) {
      prevResumeIdRef.current = resumeId;
      return;
    }

    // If resumeId changed and we have existing results, clear them
    // resumeId が変更され、既存の結果がある場合はクリア
    if (prevResumeIdRef.current !== resumeId && results.length > 0) {
      setResults([]);
      setIsMatchingComplete(false);
      setProcessedJobs(0);
      setTotalJobs(0);
      // Abort any in-progress matching
      // 進行中のマッチングを中止
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }

    prevResumeIdRef.current = resumeId;
  }, [resumeId, results.length]);

  // Hydrate results from database cache when TanStack Query data is available
  // TanStack Query データが利用可能なときにデータベースキャッシュから結果をハイドレート
  useEffect(() => {
    if (!resumeId || isMatching || !cacheData) {
      return;
    }

    // Update results if cacheData has more items (e.g., after single match from detail page)
    // cacheData により多くのアイテムがある場合は結果を更新（例：詳細ページからの単一マッチ後）
    if (cacheData.results && cacheData.results.length > 0) {
      // Only update if cache has different data
      // キャッシュに異なるデータがある場合のみ更新
      if (cacheData.results.length !== results.length) {
        setResults(cacheData.results);
        
        // Load metadata from sessionStorage to restore UI state
        // UI状態を復元するためにsessionStorageからメタデータを読み込み
        const metadata = loadBatchMatchMetadata(resumeId);
        
        // Check if new data was added (e.g., from single match in detail page)
        // 新しいデータが追加されたかチェック（例：詳細ページからの単一マッチ）
        const hasNewData = metadata && cacheData.results.length > metadata.processedJobs;
        
        // Check if metadata is valid and should be preserved
        // メタデータが有効で保持すべきかチェック
        const shouldKeepMetadata = !hasNewData && metadata && metadata.totalJobs > 0;
        
        if (shouldKeepMetadata) {
          // Keep existing metadata if it's still valid
          // 有効な場合は既存のメタデータを保持
          setIsMatchingComplete(metadata.isComplete);
          setProcessedJobs(metadata.processedJobs);
          setTotalJobs(metadata.totalJobs);
        } else {
          // Update metadata to reflect current database state (new data or no valid metadata)
          // 現在のデータベース状態を反映するようにメタデータを更新（新しいデータまたは有効なメタデータなし）
          setIsMatchingComplete(true);
          setProcessedJobs(cacheData.results.length);
          setTotalJobs(cacheData.results.length);
          saveBatchMatchMetadata(resumeId, true, cacheData.results.length, cacheData.results.length);
        }
      }
    }
    
    // Mark as hydrated after processing cache data
    // キャッシュデータの処理後にハイドレート完了としてマーク
    isHydratedRef.current = true;
  }, [resumeId, results.length, isMatching, cacheData]);

  // Persist metadata to sessionStorage (debounced) - only after user starts matching
  // メタデータを sessionStorage に永続化（デバウンス済み）- ユーザーがマッチングを開始した後のみ
  useEffect(() => {
    // Only save metadata if user has actively started matching
    // ユーザーがアクティブにマッチングを開始した場合のみメタデータを保存
    if (!resumeId || !hasStartedMatchingRef.current) {
      return;
    }

    // Don't save if all values are zero (initial state)
    // すべての値がゼロの場合は保存しない（初期状態）
    if (processedJobs === 0 && totalJobs === 0 && !isMatchingComplete) {
      return;
    }

    // Debounce the save operation to prevent excessive writes
    // 保存操作を過剰に行わないようにデバウンス
    const handle = setTimeout(() => {
      saveBatchMatchMetadata(
        resumeId,
        isMatchingComplete,
        processedJobs,
        totalJobs
      );
    }, 250);

    return () => clearTimeout(handle);
  }, [resumeId, isMatchingComplete, processedJobs, totalJobs]);

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
   * @description Process a single batch and merge results
   * @description 単一バッチを処理して結果をマージ
   * @param batch Jobs in the batch
   * @param batch バッチ内の求人
   * @param resumeText Resume text for matching
   * @param resumeText マッチング用のレジュメテキスト
   * @param currentResumeId Resume ID for database persistence
   * @param currentResumeId データベース永続化用のレジュメID
   * @param accumulatedResults Current accumulated results
   * @param accumulatedResults 現在の累積結果
   * @returns New results from this batch or null if failed
   * @returns このバッチからの新しい結果、失敗した場合は null
   */
  const processSingleBatch = async (
    batch: JobDetailV2[],
    resumeText: string,
    currentResumeId: string,
    accumulatedResults: MatchResultItem[]
  ): Promise<MatchResultItem[] | null> => {
    const serializedJobs = batch.map(job => ({
      id: job.id,
      job_description: serializeJDForBatchMatching(job),
    }));

    const batchData = await batchMutation.mutateAsync({
      resume_text: resumeText,
      resume_id: currentResumeId,
      jobs: serializedJobs,
      requestOptions: {
        signal: abortControllerRef.current?.signal || undefined,
      },
    });

    if (!batchData.match_results || !Array.isArray(batchData.match_results)) {
      return null;
    }

    // Merge new results with existing ones (avoid duplicates)
    // 新しい結果を既存の結果とマージ（重複を避ける）
    return batchData.match_results.filter(
      newResult =>
        !accumulatedResults.some(
          existing => existing.job_id === newResult.job_id
        )
    );
  };

  /**
   * @description Handle successful batch processing
   * @description バッチ処理の成功を処理
   * @param newResults New results from the batch
   * @param newResults バッチからの新しい結果
   * @param accumulatedResults Current accumulated results
   * @param accumulatedResults 現在の累積結果
   */
  const handleBatchSuccess = (
    newResults: MatchResultItem[],
    accumulatedResults: MatchResultItem[]
  ): void => {
    accumulatedResults.push(...newResults);
    setResults([...accumulatedResults]);
    setProcessedJobs(accumulatedResults.length);
  };

  /**
   * @description Finalize matching process based on success status
   * @description 成功状態に基づいてマッチング処理を完了
   * @param accumulatedResults Final accumulated results
   * @param accumulatedResults 最終的な累積結果
   * @param initialResultCount Initial result count before processing
   * @param initialResultCount 処理前の初期結果数
   * @param hasSuccessfulBatch Whether any batch succeeded
   * @param hasSuccessfulBatch バッチが成功したかどうか
   */
  const finalizeMatching = (
    accumulatedResults: MatchResultItem[],
    initialResultCount: number,
    hasSuccessfulBatch: boolean
  ): void => {
    const hasNewResults = accumulatedResults.length > initialResultCount;

    if (!hasSuccessfulBatch && !hasNewResults) {
      // All batches failed - set error state instead of marking as complete
      // すべてのバッチが失敗 - 完了としてマークする代わりにエラー状態を設定
      const friendlyError: FriendlyErrorMessage = {
        message: "すべてのバッチ処理が失敗しました。ネットワーク接続を確認して再試行してください。",
        isRetryable: true,
      };
      setErrorInfo(friendlyError);
      console.error("All batches failed - no results obtained");
      return;
    }

    // At least one batch succeeded - mark as complete
    // 少なくとも1つのバッチが成功 - 完了としてマーク
    setResults([...accumulatedResults]);
    setProcessedJobs(accumulatedResults.length);
    setIsMatchingComplete(true);
  };

  /**
   * @description Internal batch matching process
   * @description 内部バッチマッチング処理
   * @param resumeText - Resume text for matching
   * @param resumeText マッチング用のレジュメテキスト
   * @param currentResumeId - Resume ID for database persistence
   * @param currentResumeId データベース永続化用のレジュメID
   * @param jobs - Jobs to match
   * @param jobs マッチングする求人
   * @param incremental - Whether to merge new results with existing ones
   * @param incremental 新しい結果を既存の結果とマージするかどうか
   */
  const startMatchingInternal = useCallback(
    async (
      resumeText: string,
      currentResumeId: string,
      jobs: JobDetailV2[],
      incremental: boolean = false,
      existingResults: MatchResultItem[] = []
    ) => {
      const batches = chunkArray(jobs, BATCH_SIZE);

      try {
        const accumulatedResults: MatchResultItem[] = incremental
          ? [...existingResults]
          : [];
        const initialResultCount = accumulatedResults.length;
        let hasSuccessfulBatch = false;

        // Process each batch sequentially
        // 各バッチを順次処理
        for (let i = 0; i < batches.length; i++) {
          try {
            const newResults = await processSingleBatch(
              batches[i],
              resumeText,
              currentResumeId,
              accumulatedResults
            );

            if (newResults && newResults.length > 0) {
              hasSuccessfulBatch = true;
              handleBatchSuccess(newResults, accumulatedResults);
            }
          } catch (batchError) {
            if (
              batchError instanceof Error &&
              batchError.name === "AbortError"
            ) {
              return;
            }
            console.error(`Batch ${i + 1} failed:`, batchError);
          }
        }

        finalizeMatching(accumulatedResults, initialResultCount, hasSuccessfulBatch);
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
      // Mark that user has actively started matching
      // ユーザーがアクティブにマッチングを開始したことをマーク
      hasStartedMatchingRef.current = true;

      // Reset state only if not incremental matching
      // インクリメンタルマッチングでない場合のみ状態をリセット
      if (!incremental) {
        setResults([]);
        setIsMatchingComplete(false);
        setProcessedJobs(0);
        setTotalJobs(0);
        clearBatchMatchMetadata();
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

        // Validate resumeId is available for database persistence
        // データベース永続化のためresumeIdが利用可能か検証
        if (!resumeId) {
          throw new Error("resumeId is required for batch matching");
        }

        // Start matching with full job details (incremental mode)
        // 完全な求人詳細でマッチングを開始（インクリメンタルモード）
        await startMatchingInternal(
          resumeText,
          resumeId,
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
