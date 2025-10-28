/**
 * @file useMatchData.ts
 * @description Custom hook for managing match data (summary and details) with unified API calls.
 * @description 統合API呼び出しでマッチデータ（サマリーと詳細）を管理するカスタムフック。
 * @author Virginia Zhang
 * @remarks Client-side hook for unified match data management with shared logic.
 * @remarks 共有ロジックを持つ統合マッチデータ管理用クライアントサイドフック。
 */

"use client";

import { API_MATCH_DETAILS, API_MATCH_SUMMARY } from "@/app/constants/constants";
import { fetchJson } from "@/lib/fetcher";
import { getApiBase } from "@/lib/runtime-config";
import type {
  ChartsProps,
  DetailsEnvelope,
  HoverState,
  SummaryEnvelope,
  UseMatchDataResult,
} from "@/types/matching";
import { useCallback, useEffect, useState } from "react";

/**
 * @description Custom hook for managing match data with unified API calls
 * @description 統合API呼び出しでマッチデータを管理するカスタムフック
 * @param props Charts component props
 * @param props Chartsコンポーネントのプロパティ
 * @returns Match data state and controls
 * @returns マッチデータの状態とコントロール
 * @remarks Handles both summary and details API calls with shared logic
 * @remarks 共有ロジックでサマリーと詳細API呼び出しの両方を処理
 */
export function useMatchData(props: ChartsProps): UseMatchDataResult {
  const { resumeId, jobId, jobDescription, overallScore, scores } = props;

  const [summary, setSummary] = useState<SummaryEnvelope | null>(null);
  const [details, setDetails] = useState<DetailsEnvelope | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [hover, setHover] = useState<HoverState | null>(null);

  /**
   * @description Generic API call function with shared error handling
   * @description 共有エラーハンドリングを持つ汎用API呼び出し関数
   * @param type API type (summary or details)
   * @param type APIタイプ（サマリーまたは詳細）
   * @param inputs Additional inputs for the API call
   * @param inputs API呼び出しの追加入力
   * @param timeout Timeout in milliseconds
   * @param timeout タイムアウト（ミリ秒）
   * @returns Promise resolving to API response
   * @returns APIレスポンスを解決するプロミス
   */
  const callMatchAPI = useCallback(async (
    type: 'summary' | 'details',
    inputs: any,
    timeout: number
  ) => {
    const url = type === 'summary' 
      ? `${getApiBase()}${API_MATCH_SUMMARY}`
      : `${getApiBase()}${API_MATCH_DETAILS}`;

    return await fetchJson<any>(url, {
      method: "POST",
      body: JSON.stringify({
        inputs,
        jobId,
        resumeId,
      }),
      timeoutMs: timeout,
    });
  }, [jobId, resumeId]);

  // Fetch summary data independently
  // サマリーデータを独立して取得
  useEffect(() => {
    async function fetchSummary() {
      try {
        setSummaryLoading(true);
        setSummaryError(null);

        // Use provided overallScore and scores if available
        // 提供された overallScore と scores が利用可能な場合はそれを使用
        if (overallScore !== undefined && scores) {
          setSummary({
            meta: { 
              jobId,
              resumeHash: "", 
              source: "cache" as const,
              timestamp: new Date().toISOString(),
              version: "v2" as const,
              type: "summary" as const,
            }, 
            data: {
              overall: overallScore,
              scores: {
                skills: scores.skills,
                experience: scores.experience,
                projects: scores.projects,
                education: scores.education,
                soft: scores.soft,
              },
            },
          });
          setSummaryLoading(false);
          return;
        }

        const summaryData = await callMatchAPI('summary', {
          job_description: jobDescription,
        }, 30000); // 30 seconds for Dify API processing

        setSummary(summaryData);
      } catch (err) {
        setSummaryError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setSummaryLoading(false);
      }
    }

    fetchSummary();
  }, [resumeId, jobId, jobDescription, overallScore, scores, callMatchAPI]);

  // Fetch details data only after summary is completed
  // サマリー完了後にのみ詳細データを取得
  useEffect(() => {
    async function fetchDetails() {
      // Only proceed if summary is completed
      if (!summary) return;

      try {
        setDetailsLoading(true);
        setDetailsError(null);

        // Get overall score from current summary state
        if (!summary) {
          setDetailsError("Summary data not available for details analysis");
          setDetailsLoading(false);
          return;
        }
        const overallFromSummary = summary.data.overall;

        const detailsData = await callMatchAPI('details', {
          job_description: jobDescription,
          overall_from_summary: overallFromSummary,
        }, 60000); // 60 seconds for Dify API processing

        setDetails(detailsData);
      } catch (err) {
        setDetailsError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setDetailsLoading(false);
      }
    }

    fetchDetails();
  }, [resumeId, jobId, jobDescription, summary, callMatchAPI]);

  return {
    summary,
    details,
    summaryLoading,
    detailsLoading,
    summaryError,
    detailsError,
    hover,
    setHover,
  };
}
