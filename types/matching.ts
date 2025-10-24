/**
 * @file matching.ts
 * @description Type definitions for AI matching results
 * @description AI マッチング結果の型定義
 * @author Virginia Zhang
 * @remarks Shared types for match results across the application
 * @remarks アプリケーション全体で使用されるマッチング結果の共有型
 */

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

