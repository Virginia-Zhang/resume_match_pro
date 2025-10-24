/**
 * @file useBatchMatching.ts
 * @description Custom hook for batch matching with progressive results display
 * @description 段階的な結果表示を伴うバッチマッチング用カスタムフック
 * @author Virginia Zhang
 * @remarks Client-side hook for sequential batch processing with AI matching
 * @remarks AI マッチングを伴う順次バッチ処理用クライアントサイドフック
 */

"use client";

import { useState, useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { getFriendlyErrorMessage, FriendlyErrorMessage } from '@/lib/errorHandling';
import { API_MATCH_BATCH, BATCH_SIZE } from '@/app/constants/constants';
import { getApiBase } from '@/lib/runtime-config';
import type { JobDetailV2, JobListItem } from '@/types/jobs_v2';
import { serializeJDForBatchMatching } from '@/lib/jobs';
import { findJobById } from '@/app/api/jobs/mock';
import { loadBatchMatchingResults, saveBatchMatchingResults, clearBatchMatchingResults } from '@/lib/storage';

import type { MatchResultItem } from '@/types/matching';

interface UseBatchMatchingResult {
  results: MatchResultItem[];
  isMatchingComplete: boolean;
  isMatching: boolean;
  errorInfo: FriendlyErrorMessage | null;
  processedJobs: number;
  totalJobs: number;
  startMatchingFromListItems: (resumeText: string, jobListItems: JobListItem[], incremental?: boolean, totalJobsCount?: number) => Promise<void>;
}

/**
 * @description Custom hook for batch matching with progressive results display
 * @description 段階的な結果表示を伴うバッチマッチング用カスタムフック
 */
export function useBatchMatching(): UseBatchMatchingResult {
  const [results, setResults] = useState<MatchResultItem[]>([]);
  const [isMatchingComplete, setIsMatchingComplete] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [errorInfo, setErrorInfo] = useState<FriendlyErrorMessage | null>(null);
  const [processedJobs, setProcessedJobs] = useState(0);
  const [totalJobs, setTotalJobs] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  // Use ref to always access latest results value
  // 最新の results 値に常にアクセスするために ref を使用
  const resultsRef = useRef<MatchResultItem[]>([]);
  
  // Keep resultsRef in sync with results
  // resultsRef を results と同期させる
  useEffect(() => {
    resultsRef.current = results;
  }, [results]);
  
  /**
   * @description Load saved results from sessionStorage on mount (synchronously)
   * @description マウント時に sessionStorage から保存された結果を同期的に読み込む
   * @remarks Using useLayoutEffect to prevent visual flash of empty state
   * @remarks 視覚的な空白状態のフラッシュを防ぐため useLayoutEffect を使用
   */
  useLayoutEffect(() => {
    const saved = loadBatchMatchingResults();
    if (saved) {
      setResults(saved.results as MatchResultItem[]);
      setIsMatchingComplete(saved.isComplete);
      setProcessedJobs(saved.processedJobs);
      setTotalJobs(saved.totalJobs);
    }
  }, []);
  
  /**
   * @description Save results to sessionStorage whenever they change
   * @description 結果が変更されるたびに sessionStorage に保存
   */
  useEffect(() => {
    if (results.length > 0) {
      saveBatchMatchingResults(results, isMatchingComplete, processedJobs, totalJobs);
    }
  }, [results, isMatchingComplete, processedJobs, totalJobs]);
  
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
  const startMatchingFromListItems = useCallback(async (
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
      
      // Clear previous saved results
      // 以前の保存結果をクリア
      clearBatchMatchingResults();
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
      // Fetch full job details for each JobListItem
      // 各 JobListItem の完全な求人詳細を取得
      const jobDetails: JobDetailV2[] = [];
      
      for (const jobItem of jobListItems) {
        try {
          const jobDetail = findJobById(jobItem.id);
          if (jobDetail) {
            jobDetails.push(jobDetail);
          } else {
            console.warn(`Job not found: ${jobItem.id}`);
          }
        } catch (error) {
          console.error(`Error finding job ${jobItem.id}:`, error);
        }
      }
      
      if (jobDetails.length === 0) {
        throw new Error('No job details could be fetched');
      }
      
      
      // Start matching with full job details (incremental mode)
      // 完全な求人詳細でマッチングを開始（インクリメンタルモード）
      await startMatchingInternal(resumeText, jobDetails, incremental, resultsRef.current);
      
    } catch (error) {
      // Check if it was aborted
      // 中断されたかチェック
      if (error instanceof Error && error.name === 'AbortError') {

        return;
      }
      
      const friendlyError = getFriendlyErrorMessage(error);
      setErrorInfo(friendlyError);
      console.error('Matching process error:', error);
    } finally {
      setIsMatching(false);
    }
  }, []);
  
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
  const startMatchingInternal = useCallback(async (
    resumeText: string, 
    jobs: JobDetailV2[],
    incremental: boolean = false,
    existingResults: MatchResultItem[] = []
  ) => {
    // Split jobs into batches
    // ジョブをバッチに分割
    const batches = chunkArray(jobs, BATCH_SIZE);
    
    try {
      const apiUrl = `${getApiBase()}${API_MATCH_BATCH}`;
      const accumulatedResults: MatchResultItem[] = incremental ? [...existingResults] : [];
      
      // Process each batch sequentially
      // 各バッチを順次処理
      for (let i = 0; i < batches.length; i++) {
        
        try {
          // Serialize JobDetailV2 objects to optimized text for AI analysis
          // JobDetailV2 オブジェクトをAI分析用の最適化テキストにシリアライズ
          const serializedJobs = batches[i].map(job => ({
            id: job.id,
            job_description: serializeJDForBatchMatching(job)
          }));
          
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              resume_text: resumeText,
              jobs: serializedJobs
            }),
            signal: abortControllerRef.current?.signal
          });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const batchData = await response.json();
          
          // Immediately update results with new batch
          // 新しいバッチで結果を即座に更新
          if (batchData.match_results && Array.isArray(batchData.match_results)) {
            // Merge new results with existing ones (avoid duplicates)
            // 新しい結果を既存の結果とマージ（重複を避ける）
            const newResults = batchData.match_results.filter(
              (newResult: MatchResultItem) => 
                !accumulatedResults.some(existing => existing.job_id === newResult.job_id)
            );
            accumulatedResults.push(...newResults);
            setResults([...accumulatedResults]);
            setProcessedJobs(accumulatedResults.length);
          }
          
        } catch (batchError) {
          // Check if it was aborted by user navigation
          // ユーザーのナビゲーションによって中断されたかチェック
          if (batchError instanceof Error && batchError.name === 'AbortError') {
            return;
          }
          
          console.error(`Batch ${i + 1} failed:`, batchError);
          // Continue with next batch instead of stopping
          // 停止せずに次のバッチを続行
          continue;
        }
      }
      
      // Mark matching as complete
      // マッチング完了をマーク
      setIsMatchingComplete(true);
      
    } catch (error) {
      // Check if it was aborted
      // 中断されたかチェック
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      
      const friendlyError = getFriendlyErrorMessage(error);
      setErrorInfo(friendlyError);
      console.error('Matching process error:', error);
    } finally {
      setIsMatching(false);
    }
  }, []);
  
  return {
    results,
    isMatchingComplete,
    isMatching,
    errorInfo,
    processedJobs,
    totalJobs,
    startMatchingFromListItems
  };
}
