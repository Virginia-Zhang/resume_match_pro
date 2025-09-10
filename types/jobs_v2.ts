/**
 * @file jobs_v2.ts
 * @description Rich job detail types aligned with JD spec; used by mock APIs and pages.
 * @description JD仕様に合わせた詳細な求人タイプ。モックAPIやページで使用。
 * @author Virginia Zhang
 * @remarks Shared types for server/client. Keep list item lightweight for jobs list.
 * @remarks サーバー/クライアント共有。求人一覧は軽量なリスト型を使用。
 */

/**
 * @description Rich job detail schema for detail pages and APIs
 * @description 詳細ページとAPIで使用するリッチな求人スキーマ
 */
export interface JobDetailV2 {
  // 基本情報（一覧と共通）
  id: string;
  title: string;
  company: string;
  category?: string;
  location: string;
  tags: string[];
  postedAt: string; // ISO date string
  logoUrl: string;

  // 雇用・働き方
  salary?: string;
  employmentType?: string;
  interviewType?: string;
  remotePolicy?: { fromOverseas: boolean; fromJapan: boolean };

  // 説明
  description: {
    whoWeAre?: string;
    products?: string;
    productIntro?: string;
    responsibilities: string[];
  };

  // 開発情報
  devInfo?: {
    frontEnd?: {
      languages?: string[];
      frameworks?: string[];
      wasm?: string[];
      designTools?: string[];
    };
    backEnd?: {
      languages?: string[];
      frameworks?: string[];
    };
    database?: string[];
    infra?: {
      cloud?: string[];
      containers?: string[];
      monitoring?: string[];
    };
    tools?: {
      repository?: string[];
      documentation?: string[];
      communication?: string[];
      taskManagement?: string[];
    };
    methodology?: string;
  };

  // 応募要件
  requirements: {
    must: string[];
    want?: string[];
  };

  // 求める人物像
  candidateRequirements?: string[];

  // 勤務条件
  workingConditions?: {
    workingLocation?: string;
    access?: string[];
    workingHours?: string;
    workSystem?: string;
    probation?: string;
    benefits?: string[];
    remoteNote?: string;
  };

  // ポートフォリオ提出
  portfolioNote?: string[];

  // 選考プロセス
  selectionProcess?: string[];
}
