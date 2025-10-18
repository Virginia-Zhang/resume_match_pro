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

import type { MatchResultItem } from '@/types/matching';

interface UseBatchMatchingResult {
  results: MatchResultItem[];
  isMatchingComplete: boolean;
  isMatching: boolean;
  errorInfo: FriendlyErrorMessage | null;
  processedJobs: number;
  totalJobs: number;
  startMatchingFromListItems: (resumeText: string, jobListItems: JobListItem[]) => Promise<void>;
}

const STORAGE_RESULTS_KEY = 'batch-matching-results';
const STORAGE_COMPLETE_KEY = 'batch-matching-complete';
const STORAGE_PROCESSED_KEY = 'batch-matching-processed';
const STORAGE_TOTAL_KEY = 'batch-matching-total';

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
  
  /**
   * @description Load saved results from sessionStorage on mount (synchronously)
   * @description マウント時に sessionStorage から保存された結果を同期的に読み込む
   * @remarks Using useLayoutEffect to prevent visual flash of empty state
   * @remarks 視覚的な空白状態のフラッシュを防ぐため useLayoutEffect を使用
   */
  useLayoutEffect(() => {
    try {
      const savedResults = sessionStorage.getItem(STORAGE_RESULTS_KEY);
      const isComplete = sessionStorage.getItem(STORAGE_COMPLETE_KEY) === 'true';
      const savedProcessed = sessionStorage.getItem(STORAGE_PROCESSED_KEY);
      const savedTotal = sessionStorage.getItem(STORAGE_TOTAL_KEY);
      
      if (savedResults) {
        setResults(JSON.parse(savedResults));
        setIsMatchingComplete(isComplete);
        if (savedProcessed) setProcessedJobs(parseInt(savedProcessed, 10));
        if (savedTotal) setTotalJobs(parseInt(savedTotal, 10));
      }
    } catch (error) {
      console.error('Failed to load saved results:', error);
    }
  }, []);
  
  /**
   * @description Save results to sessionStorage whenever they change
   * @description 結果が変更されるたびに sessionStorage に保存
   */
  useEffect(() => {
    try {
      if (results.length > 0) {
        sessionStorage.setItem(STORAGE_RESULTS_KEY, JSON.stringify(results));
        sessionStorage.setItem(STORAGE_COMPLETE_KEY, isMatchingComplete.toString());
        sessionStorage.setItem(STORAGE_PROCESSED_KEY, processedJobs.toString());
        sessionStorage.setItem(STORAGE_TOTAL_KEY, totalJobs.toString());
      }
    } catch (error) {
      console.error('Failed to save results:', error);
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
   */
  const startMatchingFromListItems = useCallback(async (resumeText: string, jobListItems: JobListItem[]) => {
    // Reset state
    // 状態をリセット
    setResults([]);
    setIsMatchingComplete(false);
    setIsMatching(true);
    setErrorInfo(null);
    setTotalJobs(jobListItems.length);
    setProcessedJobs(0);
    
    // Clear previous saved results
    // 以前の保存結果をクリア
    sessionStorage.removeItem(STORAGE_RESULTS_KEY);
    sessionStorage.removeItem(STORAGE_COMPLETE_KEY);
    sessionStorage.removeItem(STORAGE_PROCESSED_KEY);
    sessionStorage.removeItem(STORAGE_TOTAL_KEY);
    
    // Create new AbortController for this matching session
    // このマッチングセッション用の新しい AbortController を作成
    abortControllerRef.current = new AbortController();
    
    try {
      // Fetch full job details for each JobListItem
      // 各 JobListItem の完全な求人詳細を取得
      console.log(`📋 Fetching job details for ${jobListItems.length} jobs...`);
      const jobDetails: JobDetailV2[] = [];
      
      for (const jobItem of jobListItems) {
        try {
          const jobDetail = findJobById(jobItem.id);
          if (jobDetail) {
            jobDetails.push(jobDetail);
          } else {
            console.warn(`⚠️ Job not found: ${jobItem.id}`);
          }
        } catch (error) {
          console.error(`❌ Error finding job ${jobItem.id}:`, error);
        }
      }
      
      if (jobDetails.length === 0) {
        throw new Error('No job details could be fetched');
      }
      
      console.log(`✅ Fetched ${jobDetails.length} job details`);
      
      // Start matching with full job details
      // 完全な求人詳細でマッチングを開始
      await startMatchingInternal(resumeText, jobDetails);
      
    } catch (error) {
      // Check if it was aborted
      // 中断されたかチェック
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('🛑 Matching cancelled by user navigation');
        return;
      }
      
      const friendlyError = getFriendlyErrorMessage(error);
      setErrorInfo(friendlyError);
      console.error('❌ Matching process error:', error);
    } finally {
      setIsMatching(false);
    }
  }, []);
  
  /**
   * @description Internal batch matching process
   * @description 内部バッチマッチング処理
   */
  const startMatchingInternal = useCallback(async (resumeText: string, jobs: JobDetailV2[]) => {
    // Split jobs into batches
    // ジョブをバッチに分割
    const batches = chunkArray(jobs, BATCH_SIZE);
    
    try {
      const apiUrl = `${getApiBase()}${API_MATCH_BATCH}`;
      const accumulatedResults: MatchResultItem[] = [];
      
      // Process each batch sequentially
      // 各バッチを順次処理
      for (let i = 0; i < batches.length; i++) {
        console.log(`📦 Processing batch ${i + 1}/${batches.length}`);
        
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
            accumulatedResults.push(...batchData.match_results);
            setResults([...accumulatedResults]);
            setProcessedJobs(accumulatedResults.length);
            console.log(`✅ Batch ${i + 1} completed: ${batchData.match_results.length} results`);
          }
          
        } catch (batchError) {
          // Check if it was aborted by user navigation
          // ユーザーのナビゲーションによって中断されたかチェック
          if (batchError instanceof Error && batchError.name === 'AbortError') {
            console.log('🛑 Matching cancelled by user navigation');
            return;
          }
          
          console.error(`❌ Batch ${i + 1} failed:`, batchError);
          // Continue with next batch instead of stopping
          // 停止せずに次のバッチを続行
          continue;
        }
      }
      
      // Mark matching as complete
      // マッチング完了をマーク
      setIsMatchingComplete(true);
      console.log(`✅ All batches completed: ${accumulatedResults.length} total results`);
      
    } catch (error) {
      // Check if it was aborted
      // 中断されたかチェック
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('🛑 Matching cancelled by user navigation');
        return;
      }
      
      const friendlyError = getFriendlyErrorMessage(error);
      setErrorInfo(friendlyError);
      console.error('❌ Matching process error:', error);
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
