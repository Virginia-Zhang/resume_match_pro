/**
 * @file db-to-types.ts
 * @description Convert database records to TypeScript types (JobDetailV2, JobListItem)
 * @description データベースレコードを TypeScript 型（JobDetailV2, JobListItem）に変換
 * @author Virginia Zhang
 * @remarks Handles timestamp to ISO string conversion, JSONB field parsing, and array handling
 * @remarks タイムスタンプから ISO 文字列への変換、JSONB フィールドのパース、配列の処理を行う
 */

import type { JobDetailV2, JobListItem } from "@/types/jobs_v2";

/**
 * @description Database job record type (inferred from Supabase response)
 * @description データベースの求人レコード型（Supabase レスポンスから推測）
 * @remarks This type should match your Supabase jobs table schema
 * @remarks この型は Supabase jobs テーブルのスキーマと一致する必要があります
 */
export interface DbJobRecord {
  id: string;
  title: string;
  company: string;
  category?: string | null;
  location: string;
  tags: string[] | null;
  posted_at: string; // PostgreSQL timestamp (e.g., '2025-10-01 00:00:00')
  logo_url: string;
  salary?: string | null;
  employment_type?: string | null;
  interview_type?: string | null;
  remote_policy?: {
    from_overseas: boolean;
    from_japan: boolean;
  } | null;
  language_requirements: {
    ja: string;
    en: string;
  } | null;
  recruit_from_overseas: boolean;
  description?: {
    whoWeAre?: string;
    products?: string;
    productIntro?: string;
    responsibilities: string[];
  } | null;
  dev_info?: {
    frontEnd?: {
      languages?: string[];
      frameworks?: string[];
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
  } | null;
  requirements: {
    must: string[];
    want?: string[];
  } | null;
  candidate_requirements?: string[] | null;
  working_conditions?: {
    workingLocation?: string;
    access?: string[];
    workingHours?: string;
    workSystem?: string;
    probation?: string;
    benefits?: string[];
    remoteNote?: string;
  } | null;
  portfolio_note?: string[] | null;
  selection_process?: string[] | null;
}

/**
 * @description Convert PostgreSQL timestamp to ISO 8601 string
 * @description PostgreSQL タイムスタンプを ISO 8601 文字列に変換
 * @param timestamp PostgreSQL timestamp string (e.g., '2025-10-01 00:00:00' or '2025-10-01T00:00:00Z')
 * @param timestamp PostgreSQL タイムスタンプ文字列（例：'2025-10-01 00:00:00' または '2025-10-01T00:00:00Z'）
 * @returns ISO 8601 string (e.g., '2025-10-01T00:00:00.000Z')
 * @returns ISO 8601 文字列（例：'2025-10-01T00:00:00.000Z'）
 * @remarks If timestamp already has timezone info, uses it as-is. Otherwise assumes UTC (PostgreSQL default).
 * @remarks タイムスタンプに既にタイムゾーン情報がある場合はそのまま使用。それ以外は UTC（PostgreSQL のデフォルト）と仮定。
 */
function dbTimestampToISO(timestamp: string): string {
  // Check if timestamp already has timezone information
  // タイムスタンプに既にタイムゾーン情報があるかチェック
  const hasTimezone = /[+-]\d{2}:?\d{2}$|Z$/.test(timestamp);
  
  if (hasTimezone) {
    // Already has timezone info, use as-is
    // 既にタイムゾーン情報がある場合はそのまま使用
    return new Date(timestamp).toISOString();
  }
  
  // No timezone info: PostgreSQL typically stores timestamps in UTC
  // タイムゾーン情報なし：PostgreSQL は通常 UTC でタイムスタンプを保存
  // Replace space with T and append Z to indicate UTC
  // スペースを T に置き換え、UTC を示すために Z を追加
  const isoString = timestamp.replace(" ", "T") + "Z";
  return new Date(isoString).toISOString();
}

/**
 * @description Convert database record to JobDetailV2
 * @description データベースレコードを JobDetailV2 に変換
 * @param dbRecord Database job record
 * @param dbRecord データベースの求人レコード
 * @returns JobDetailV2 object
 * @returns JobDetailV2 オブジェクト
 */
export function dbJobToJobDetailV2(dbRecord: DbJobRecord): JobDetailV2 {
  return {
    // Basic information / 基本情報
    id: dbRecord.id,
    title: dbRecord.title,
    company: dbRecord.company,
    category: dbRecord.category ?? undefined,
    location: dbRecord.location,
    tags: dbRecord.tags ?? [],
    postedAt: dbTimestampToISO(dbRecord.posted_at),
    logoUrl: dbRecord.logo_url,

    // Employment and work style / 雇用・働き方
    salary: dbRecord.salary ?? undefined,
    employmentType: dbRecord.employment_type ?? undefined,
    interviewType: dbRecord.interview_type ?? undefined,
    remotePolicy: dbRecord.remote_policy
      ? {
          fromOverseas: dbRecord.remote_policy.from_overseas,
          fromJapan: dbRecord.remote_policy.from_japan,
        }
      : undefined,
    languageRequirements: dbRecord.language_requirements ?? {
      ja: "None",
      en: "None",
    },
    recruitFromOverseas: dbRecord.recruit_from_overseas,

    // Description / 説明
    description: {
      whoWeAre: dbRecord.description?.whoWeAre,
      products: dbRecord.description?.products,
      productIntro: dbRecord.description?.productIntro,
      responsibilities: dbRecord.description?.responsibilities ?? [],
    },

    // Development information / 開発情報
    devInfo: dbRecord.dev_info
      ? {
          frontEnd: dbRecord.dev_info.frontEnd
            ? {
                languages: dbRecord.dev_info.frontEnd.languages,
                frameworks: dbRecord.dev_info.frontEnd.frameworks,
              }
            : undefined,
          backEnd: dbRecord.dev_info.backEnd
            ? {
                languages: dbRecord.dev_info.backEnd.languages,
                frameworks: dbRecord.dev_info.backEnd.frameworks,
              }
            : undefined,
          database: dbRecord.dev_info.database,
          infra: dbRecord.dev_info.infra
            ? {
                cloud: dbRecord.dev_info.infra.cloud,
                containers: dbRecord.dev_info.infra.containers,
                monitoring: dbRecord.dev_info.infra.monitoring,
              }
            : undefined,
          tools: dbRecord.dev_info.tools
            ? {
                repository: dbRecord.dev_info.tools.repository,
                documentation: dbRecord.dev_info.tools.documentation,
                communication: dbRecord.dev_info.tools.communication,
                taskManagement: dbRecord.dev_info.tools.taskManagement,
              }
            : undefined,
          methodology: dbRecord.dev_info.methodology,
        }
      : undefined,

    // Requirements / 応募要件
    requirements: {
      must: dbRecord.requirements?.must ?? [],
      want: dbRecord.requirements?.want,
    },

    // Candidate requirements / 求める人物像
    candidateRequirements: dbRecord.candidate_requirements ?? undefined,

    // Working conditions / 勤務条件
    workingConditions: dbRecord.working_conditions
      ? {
          workingLocation: dbRecord.working_conditions.workingLocation,
          access: dbRecord.working_conditions.access,
          workingHours: dbRecord.working_conditions.workingHours,
          workSystem: dbRecord.working_conditions.workSystem,
          probation: dbRecord.working_conditions.probation,
          benefits: dbRecord.working_conditions.benefits,
          remoteNote: dbRecord.working_conditions.remoteNote,
        }
      : undefined,

    // Portfolio note / ポートフォリオ提出
    portfolioNote: dbRecord.portfolio_note ?? undefined,

    // Selection process / 選考プロセス
    selectionProcess: dbRecord.selection_process ?? undefined,
  };
}

/**
 * @description Convert database record to JobListItem
 * @description データベースレコードを JobListItem に変換
 * @param dbRecord Database job record
 * @param dbRecord データベースの求人レコード
 * @returns JobListItem object
 * @returns JobListItem オブジェクト
 * @remarks Creates lightweight list item from database record
 * @remarks データベースレコードから軽量なリストアイテムを作成
 */
export function dbJobToJobListItem(dbRecord: DbJobRecord): JobListItem {
  return {
    id: dbRecord.id,
    title: dbRecord.title,
    company: dbRecord.company,
    location: dbRecord.location,
    tags: dbRecord.tags ?? [],
    postedAt: dbTimestampToISO(dbRecord.posted_at),
    logoUrl: dbRecord.logo_url,
    recruitFromOverseas: dbRecord.recruit_from_overseas,
  };
}






