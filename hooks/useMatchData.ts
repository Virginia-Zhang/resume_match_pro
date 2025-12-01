/**
 * @file useMatchData.ts
 * @description Custom hook for managing match data (summary and details) with unified API calls.
 * @description 統合API呼び出しでマッチデータ（サマリーと詳細）を管理するカスタムフック。
 * @author Virginia Zhang
 * @remarks Client-side hook for unified match data management with shared logic.
 * @remarks 共有ロジックを持つ統合マッチデータ管理用クライアントサイドフック。
 */

"use client";

import {
  useMatchDetailsMutation,
  useMatchSummaryMutation,
} from "@/hooks/queries/useMatch";
import type {
  ChartsProps,
  DetailsEnvelope,
  HoverState,
  SummaryEnvelope,
  UseMatchDataResult,
} from "@/types/matching";
import { useEffect, useRef, useState } from "react";

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
  const detailsRequestedRef = useRef(false);
  // Track if we're using cached summary to prevent stale API responses from overwriting
  // キャッシュされたサマリーを使用しているかを追跡し、過去のAPI応答による上書きを防ぐ
  const usingCachedSummaryRef = useRef(false);
  const { mutate: mutateSummary, reset: resetSummary } = useMatchSummaryMutation();
  const { mutate: mutateDetails, reset: resetDetails } = useMatchDetailsMutation();

  // Fetch summary data independently
  // サマリーデータを独立して取得
  useEffect(() => {
    detailsRequestedRef.current = false;
    setDetails(null);
    setSummaryError(null);

    // Use provided overallScore and scores if available
    // 提供された overallScore と scores が利用可能な場合はそれを使用
    if (overallScore !== undefined && scores) {
      usingCachedSummaryRef.current = true;
      const cachedSummary: SummaryEnvelope = {
        meta: {
          jobId,
          resumeHash: "",
          source: "cache",
          timestamp: new Date().toISOString(),
          version: "v2",
          type: "summary",
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
      };
      setSummary(cachedSummary);
      setSummaryLoading(false);
      return;
    }

    // Reset cached flag when fetching from API
    // APIから取得する際はキャッシュフラグをリセット
    usingCachedSummaryRef.current = false;

    if (!resumeId || !jobId) {
      setSummaryError("Missing resumeId or jobId for summary analysis");
      setSummaryLoading(false);
      return;
    }

    setSummaryLoading(true);
    mutateSummary(
      {
        jobId,
        resumeId,
        inputs: { job_description: jobDescription },
      },
      {
        onSuccess: data => {
          // Only update if we're not using cached summary to prevent race condition
          // キャッシュされたサマリーを使用していない場合のみ更新し、競合状態を防ぐ
          if (!usingCachedSummaryRef.current) {
            setSummary(data);
          }
        },
        onError: err =>
          setSummaryError(err instanceof Error ? err.message : "Unknown error"),
        onSettled: () => setSummaryLoading(false),
      }
    );

    return () => {
      resetSummary();
    };
  }, [
    resumeId,
    jobId,
    jobDescription,
    overallScore,
    scores,
    mutateSummary,
    resetSummary,
  ]);

  // Fetch details data only after summary is completed
  // サマリー完了後にのみ詳細データを取得
  useEffect(() => {
    if (!summary) {
      detailsRequestedRef.current = false;
      // If summary loading is complete but summary is null (e.g., failed), stop details loading
      // サマリー読み込みが完了したが summary が null の場合（失敗など）、詳細読み込みを停止
      if (!summaryLoading) {
        setDetailsLoading(false);
      }
      return;
    }
    if (detailsRequestedRef.current) return;
    setDetailsError(null);

    if (!resumeId || !jobId) {
      setDetailsError("Missing resumeId or jobId for details analysis");
      setDetailsLoading(false);
      return;
    }

    const overallFromSummary = summary?.data?.overall;
    if (overallFromSummary === undefined) {
      setDetailsError("Missing overall score from summary");
      setDetailsLoading(false);
      return;
    }

    // Set ref to true only after all validation checks pass
    // すべての検証チェックが通過した後にのみ ref を true に設定
    detailsRequestedRef.current = true;
    setDetailsLoading(true);
    mutateDetails(
      {
        jobId,
        resumeId,
        inputs: {
          job_description: jobDescription,
          overall_from_summary: overallFromSummary,
        },
      },
      {
        onSuccess: data => setDetails(data),
        onError: err =>
          setDetailsError(err instanceof Error ? err.message : "Unknown error"),
        onSettled: () => setDetailsLoading(false),
      }
    );

    return () => {
      detailsRequestedRef.current = false;
      resetDetails();
    };
  }, [resumeId, jobId, jobDescription, summary, summaryLoading, mutateDetails, resetDetails]);

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
