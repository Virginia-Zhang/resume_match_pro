/**
 * @file lib/react-query/query-keys.ts
 * @description Centralized TanStack Query key factory to keep cache keys consistent.
 * @description キャッシュキーを一元管理する TanStack Query キーファクトリ。
 * @author Virginia Zhang
 * @remarks Shared across server prefetching and client hooks to avoid duplication.
 * @remarks サーバープリフェッチとクライアントフックの両方で共有し、重複を回避。
 */

/**
 * @description Query key helpers grouped by domain (jobs, resume, match).
 * @description ドメイン（求人、レジュメ、マッチ）ごとにまとめたクエリキーのヘルパー。
 */
export const queryKeys = {
  jobs: {
    all: ["jobs"] as const,
    list: (filtersKey = "all") => ["jobs", "list", filtersKey] as const,
    detail: (jobId: string) => ["jobs", "detail", jobId] as const,
    categories: () => ["jobs", "categories"] as const,
  },
  resume: {
    text: (resumeId?: string | null) => ["resume", "text", resumeId ?? ""] as const,
    parse: () => ["resume", "parse"] as const,
    upload: () => ["resume", "upload"] as const,
  },
  match: {
    scoring: () => ["match", "scoring"] as const,
    details: () => ["match", "details"] as const,
    batch: (resumeId?: string | null) =>
      ["match", "batch", resumeId ?? ""] as const,
  },
} as const;


