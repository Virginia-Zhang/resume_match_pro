/**
 * @file jobs.ts
 * @description Type definitions for job list and detail data structures used across pages.
 * @description ページ全体で使用する求人一覧と求人詳細の型定義。
 * @author Virginia Zhang
 * @remarks Shared types; imported by server and client components.
 * @remarks 共有型。サーバー/クライアント両方のコンポーネントでインポートされる。
 */

export interface JobListItem {
  id: string;
  title: string; // e.g., "シニアフロントエンドソフトウェアエンジニア"
  company: string; // e.g., "Kraken"
  location: string; // e.g., "東京都, 日本"
  tags: string[]; // e.g., ["frontend"]
  postedAt: string; // ISO date; UI renders relative time
  logoUrl: string; // required
}

export interface JobDetail extends JobListItem {
  salary?: string;
  employmentType?: string;
  interviewType?: string;
  remotePolicy?: { fromOverseas: boolean; fromJapan: boolean };

  description: {
    productIntro?: string;
    responsibilities: string[];
  };

  internationalTeam?: {
    total?: number;
    nationalities?: string[];
    languageRequirement?: string;
  };

  workEnvironment?: string[];
  appealPoints?: string[];

  techStack?: {
    languages?: string[];
    frameworks?: string[];
    infra?: string[];
    testing?: string[];
    database?: string[];
    tools?: string[];
  };

  requirements: {
    must: string[];
    want?: string[];
  };

  idealCandidate?: string[];

  workingConditions?: {
    holidays?: string[];
    welfare?: string[];
    coreHours?: string;
    remoteNote?: string;
  };

  selectionProcess?: string[];
}
