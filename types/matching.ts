/**
 * @file matching.ts
 * @description Type definitions for AI matching results and related interfaces
 * @description AI マッチング結果と関連インターフェースの型定義
 * @author Virginia Zhang
 * @remarks Shared types for match results across the application
 * @remarks アプリケーション全体で使用されるマッチング結果の共有型
 */

/**
 * @description Match type for API requests
 * @description APIリクエスト用のマッチタイプ
 */
export type MatchType = "scoring" | "details";

/**
 * @description Base request body interface for match API
 * @description マッチAPIのベースリクエストボディインターフェース
 */
export interface BaseRequestBody {
  inputs: {
    job_description: string;
    overall_from_scoring?: number;
  };
  jobId: string;
  resumeId: string;
}

/**
 * @description Scoring data structure returned by Dify workflow
 * @description Difyワークフローから返されるスコアデータ構造
 */
export interface ScoringData {
  overall: number;
  scores: Record<string, number>;
}

/**
 * @description Details data structure returned by Dify workflow
 * @description Difyワークフローから返される詳細データ構造
 */
export interface DetailsData {
  advantages: string[];
  disadvantages: string[];
  advice: Array<{
    title: string;
    detail: string;
  }>;
  overview: string;
}

/**
 * @description Source type for match results
 * @description マッチング結果のソースタイプ
 * @remarks "single" - Generated from single job matching (detail page)
 * @remarks "single" - 単一求人マッチング（詳細ページ）から生成
 * @remarks "batch" - Generated from batch matching (jobs list page)
 * @remarks "batch" - バッチマッチング（求人一覧ページ）から生成
 */
export type MatchSource = "single" | "batch";

/**
 * @description Envelope structure for API response with metadata
 * @description メタデータ付きAPIレスポンスのエンベロープ構造
 */
export interface MatchEnvelope<T> {
  meta: {
    jobId: string;
    resumeHash: string;
    source: MatchSource;
    timestamp: string;
    version: "v1" | "v2";
    type: MatchType;
  };
  data: T;
}

/**
 * @description Type aliases for specific envelope types
 * @description 特定のエンベロープタイプの型エイリアス
 */
export type ScoringEnvelope = MatchEnvelope<ScoringData>;
export type DetailsEnvelope = MatchEnvelope<DetailsData>;

/**
 * @description Props interface for Charts component
 * @description Chartsコンポーネントのプロパティインターフェース
 */
export interface ChartsProps {
  resumeId: string;
  jobId: string;
  jobDescription: string;
  overallScore?: number;
  scores?: {
    skills: number;
    experience: number;
    projects: number;
    education: number;
    soft: number;
  };
}

/**
 * @description Hover state for radar chart interaction
 * @description レーダーチャートのインタラクション用ホバー状態
 */
export interface HoverState {
  name: string;
  value: number;
}

/**
 * @description Return type for useMatchData hook
 * @description useMatchDataフックの戻り値型
 */
export interface UseMatchDataResult {
  scoring: ScoringEnvelope | null;
  details: DetailsEnvelope | null;
  scoringLoading: boolean;
  detailsLoading: boolean;
  scoringError: string | null;
  detailsError: string | null;
  hover: HoverState | null;
  setHover: React.Dispatch<React.SetStateAction<HoverState | null>>;
}

/**
 * @description Return type for useBatchMatching hook
 * @description useBatchMatchingフックの戻り値型
 */
export interface UseBatchMatchingResult {
  results: MatchResultItem[];
  isMatchingComplete: boolean;
  isMatching: boolean;
  errorInfo: any; // Will be updated when we see the actual error type
  processedJobs: number;
  totalJobs: number;
  startMatchingFromListItems: (
    resumeText: string, 
    jobListItems: any[], 
    incremental?: boolean, 
    totalJobsCount?: number
  ) => Promise<void>;
}

/**
 * @description Match result item with overall score and detailed scores
 * @description 総合スコアと詳細スコアを含むマッチング結果アイテム
 */
export interface MatchResultItem {
  job_id: string;
  overall: number;
  scores: {
    skills: number;
    experience: number;
    projects: number;
    education: number;
    soft: number;
  };
}

/**
 * @description Recommendation level based on overall score
 * @description 総合スコアに基づく推薦レベル
 */
export type RecommendationLevel = "高い" | "中程度" | "低い";

