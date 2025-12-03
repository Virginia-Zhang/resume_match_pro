/**
 * @file useMatchData.ts
 * @description Custom hook for managing match data (scoring and details) with unified API calls.
 * @description 統合API呼び出しでマッチデータ（スコアリングと詳細）を管理するカスタムフック。
 * @author Virginia Zhang
 * @remarks Client-side hook for unified match data management with shared logic.
 * @remarks 共有ロジックを持つ統合マッチデータ管理用クライアントサイドフック。
 */

"use client";

import {
  useMatchDetailsMutation,
  useMatchScoringMutation,
} from "@/hooks/queries/useMatch";
import type {
  ChartsProps,
  DetailsEnvelope,
  HoverState,
  ScoringEnvelope,
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
 * @remarks Handles both scoring and details API calls with shared logic
 * @remarks 共有ロジックでスコアリングと詳細API呼び出しの両方を処理
 */
export function useMatchData(props: ChartsProps): UseMatchDataResult {
  const { resumeId, jobId, jobDescription, overallScore, scores } = props;

  const [scoring, setScoring] = useState<ScoringEnvelope | null>(null);
  const [details, setDetails] = useState<DetailsEnvelope | null>(null);
  const [scoringLoading, setScoringLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(true);
  const [scoringError, setScoringError] = useState<string | null>(null);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [hover, setHover] = useState<HoverState | null>(null);
  const detailsRequestedRef = useRef(false);
  // Track if we're using cached scoring to prevent stale API responses from overwriting
  // キャッシュされたスコアリングを使用しているかを追跡し、過去のAPI応答による上書きを防ぐ
  const usingCachedScoringRef = useRef(false);
  const { mutate: mutateScoring, reset: resetScoring } = useMatchScoringMutation();
  const { mutate: mutateDetails, reset: resetDetails } = useMatchDetailsMutation();

  // Fetch scoring data independently
  // スコアリングデータを独立して取得
  useEffect(() => {
    detailsRequestedRef.current = false;
    // Clear scoring and details at first to prevent using stale scoring data when jobId changes
    // ジョブIDが変更された場合に古いスコアリングデータを使用しないようにするため、最初にスコアリングと詳細をクリア
    setScoring(null);
    setDetails(null);
    setScoringError(null);

    // Use provided overallScore and scores if available
    // 提供された overallScore と scores が利用可能な場合はそれを使用
    if (overallScore !== undefined && scores) {
      usingCachedScoringRef.current = true;
      const cachedScoring: ScoringEnvelope = {
        meta: {
          jobId,
          resumeHash: "",
          source: "cache",
          timestamp: new Date().toISOString(),
          version: "v2",
          type: "scoring",
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
      setScoring(cachedScoring);
      setScoringLoading(false);
      return;
    }

    // Reset cached flag when fetching from API
    // APIから取得する際はキャッシュフラグをリセット
    usingCachedScoringRef.current = false;

    if (!resumeId || !jobId) {
      setScoringError("Missing resumeId or jobId for scoring analysis");
      setScoringLoading(false);
      return;
    }

    setScoringLoading(true);
    mutateScoring(
      {
        jobId,
        resumeId,
        inputs: { job_description: jobDescription },
      },
      {
        onSuccess: data => {
          // Only update if we're not using cached scoring to prevent race condition
          // キャッシュされたスコアリングを使用していない場合のみ更新し、競合状態を防ぐ
          if (!usingCachedScoringRef.current) {
            setScoring(data);
          }
        },
        onError: err =>
          setScoringError(err instanceof Error ? err.message : "Unknown error"),
        onSettled: () => setScoringLoading(false),
      }
    );

    return () => {
      resetScoring();
    };
  }, [
    resumeId,
    jobId,
    jobDescription,
    overallScore,
    scores,
    mutateScoring,
    resetScoring,
  ]);

  // Fetch details data only after scoring is completed
  // スコアリング完了後にのみ詳細データを取得
  useEffect(() => {
    if (!scoring) {
      detailsRequestedRef.current = false;
      // If scoring loading is complete but scoring is null (e.g., failed), stop details loading
      // スコアリング読み込みが完了したが scoring が null の場合（失敗など）、詳細読み込みを停止
      if (!scoringLoading) {
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

    const overallFromScoring = scoring?.data?.overall;
    if (overallFromScoring === undefined) {
      setDetailsError("Missing overall score from scoring");
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
          overall_from_scoring: overallFromScoring,
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
  }, [resumeId, jobId, jobDescription, scoring, scoringLoading, mutateDetails, resetDetails]);

  return {
    scoring,
    details,
    scoringLoading,
    detailsLoading,
    scoringError,
    detailsError,
    hover,
    setHover,
  };
}
