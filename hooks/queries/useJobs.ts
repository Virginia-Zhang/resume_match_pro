/**
 * @file hooks/queries/useJobs.ts
 * @description TanStack Query hooks for jobs list, job detail, and job categories.
 * @description 求人一覧・詳細・カテゴリ用の TanStack Query フック。
 * @author Virginia Zhang
 * @remarks Client hook module; uses shared API helpers and query keys for caching.
 * @remarks 共有APIヘルパーとクエリキーを利用するクライアント用フック。
 */

"use client";

import { fetchJobById, fetchJobCategories, fetchJobs } from "@/lib/api/jobs";
import { queryKeys } from "@/lib/react-query/query-keys";
import type { JobDetailV2 } from "@/types/jobs_v2";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

type ResidenceFilter = "japan" | "overseas";
type LocationFilter = "tokyo" | "other";

/**
 * @description Filter options for job list queries.
 * @description 求人一覧クエリ用のフィルターオプション。
 */
export interface JobListFilters {
  categories?: string[];
  residence?: ResidenceFilter;
  locations?: LocationFilter[];
}

interface NormalizedJobFilters {
  categories: string[];
  residence: ResidenceFilter | "";
  locations: LocationFilter[];
  key: string;
  hasFilters: boolean;
}

interface UseJobsOptions {
  enabled?: boolean;
  apiBase?: string;
}

interface UseJobByIdOptions {
  enabled?: boolean;
  apiBase?: string;
}

interface UseJobCategoriesOptions {
  enabled?: boolean;
  apiBase?: string;
}

/**
 * @description Fetch jobs with optional client-side filtering via TanStack Query.
 * @description TanStack Query を用いた求人取得フック（任意のクライアントフィルター対応）。
 */
export function useJobs(filters?: JobListFilters, options?: UseJobsOptions) {
  const normalizedFilters = useMemo(() => normalizeJobFilters(filters), [filters]);

  // Use keepPreviousData to keep the previous data when the filters change, this is a good practice to avoid flickering
  // フィルター変更時に前のデータを保持し、フリッカーを防ぐための良い慣習
  return useQuery({
    queryKey: queryKeys.jobs.list(normalizedFilters.key),
    queryFn: ({ signal }) => fetchJobs(options?.apiBase ?? "", signal),
    select: data =>
      normalizedFilters.hasFilters ? filterJobs(data, normalizedFilters) : data,
    enabled: options?.enabled ?? true,
    placeholderData: keepPreviousData,
  });
}

/**
 * @description Fetch a single job by ID via TanStack Query.
 * @description TanStack Query で単一求人を取得するフック。
 */
export function useJobById(jobId?: string, options?: UseJobByIdOptions) {
  return useQuery({
    queryKey: queryKeys.jobs.detail(jobId ?? "unknown"),
    queryFn: ({ signal }) => {
      if (!jobId) {
        throw new Error("jobId is required to fetch job detail");
      }
      return fetchJobById(jobId, options?.apiBase ?? "", signal);
    },
    enabled: Boolean(jobId) && (options?.enabled ?? true),
  });
}

/**
 * @description Fetch job categories for filters via TanStack Query.
 * @description TanStack Query で求人カテゴリを取得するフック。
 */
export function useJobCategories(options?: UseJobCategoriesOptions) {
  return useQuery({
    queryKey: queryKeys.jobs.categories(),
    queryFn: ({ signal }) => fetchJobCategories(options?.apiBase ?? "", signal),
    enabled: options?.enabled ?? true,
  });
}

/**
 * @description Normalize user-provided job filters and build a deterministic cache key.
 * @description ユーザー指定の求人フィルターを正規化し、決定的なキャッシュキーを生成する。
 * @param filters Job list filters supplied by UI / UIから渡される求人フィルター
 * @param filters UI から渡される求人フィルター
 * @returns Normalized filters with stable ordering and derived metadata
 * @returns 安定した順序と付加メタデータを持つ正規化済みフィルター
 */
function normalizeJobFilters(filters?: JobListFilters): NormalizedJobFilters {
  if (!filters) {
    return {
      categories: [],
      residence: "",
      locations: [],
      key: "all",
      hasFilters: false,
    };
  }

  const categories = [...(filters.categories ?? [])].sort((a, b) =>
    a.localeCompare(b, "en", { sensitivity: "base" })
  );
  const locations = [...(filters.locations ?? [])].sort((a, b) =>
    a.localeCompare(b, "en", { sensitivity: "base" })
  );
  const residence = filters.residence ?? "";

  const hasFilters =
    categories.length > 0 || locations.length > 0 || Boolean(residence);

  return {
    categories,
    residence,
    locations,
    key: hasFilters
      ? JSON.stringify({ categories, residence, locations })
      : "all",
    hasFilters,
  };
}

/**
 * @description Apply normalized filters to a JobDetail collection on the client.
 * @description 正規化済みフィルターをクライアント側で JobDetail コレクションに適用する。
 * @param jobs JobDetailV2 list to filter
 * @param jobs フィルタリング対象の JobDetailV2 リスト
 * @param filters Normalized filter object
 * @param filters 正規化済みフィルターオブジェクト
 * @returns Filtered jobs respecting category/residence/location criteria
 * @returns 職種・居住地・勤務地条件を満たすフィルター結果
 */
function filterJobs(jobs: JobDetailV2[], filters: NormalizedJobFilters): JobDetailV2[] {
  let filtered = [...jobs];

  if (filters.categories.length > 0) {
    filtered = filtered.filter(job =>
      job.tags.some(tag => filters.categories.includes(tag))
    );
  }

  if (filters.residence === "overseas") {
    filtered = filtered.filter(job => job.recruitFromOverseas === true);
  }

  if (filters.locations.length === 1) {
    const [locationFilter] = filters.locations;
    if (locationFilter === "tokyo") {
      filtered = filtered.filter(job => job.location === "東京都");
    } else if (locationFilter === "other") {
      filtered = filtered.filter(job => job.location !== "東京都");
    }
  }

  return filtered;
}


