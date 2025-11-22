/**
 * @file lib/api/jobs.ts
 * @description REST helpers for job list/detail/category endpoints used by TanStack Query.
 * @description TanStack Query で使用する求人一覧・詳細・カテゴリ API ヘルパー。
 * @author Virginia Zhang
 * @remarks Runs on server or client; relies on Next.js App Router routes under /api/jobs*.
 * @remarks サーバー/クライアント両対応で、/api/jobs* 配下の Next.js App Router ルートを利用。
 */

import { buildApiUrl } from "@/lib/api/helpers";
import { fetchJson } from "@/lib/fetcher";
import type { JobDetailV2 } from "@/types/jobs_v2";

/**
 * @description Job category shape returned by /api/job-categories.
 * @description /api/job-categories が返す求人カテゴリの形。
 */
export interface JobCategory {
  label: string;
  value: string;
}

/**
 * @description Fetches every job detail document for list pages or prefetching.
 * @description 求人一覧ページやプリフェッチ用に全求人詳細ドキュメントを取得する。
 * @param apiBase Optional API base override for SSR or testing.
 * @param apiBase SSR やテスト用のオプション API ベース指定。
 * @param signal Optional AbortSignal to cancel the pending request.
 * @param signal ペンディング中のリクエストをキャンセルするためのオプション AbortSignal。
 * @returns Promise resolving to an array of JobDetailV2 objects.
 * @returns JobDetailV2 配列を解決するプロミス。
 * @throws Error when the network request fails or the server returns non-2xx.
 * @throws ネットワーク失敗やサーバーが非2xxを返した場合にエラーをスロー。
 */
export async function fetchJobs(
  apiBase = "",
  signal?: AbortSignal
): Promise<JobDetailV2[]> {
  const url = buildApiUrl("/api/jobs", apiBase);
  return fetchJson<JobDetailV2[]>(url, { signal });
}

/**
 * @description Fetches job detail by identifier for detail pages or hooks.
 * @description 詳細ページやフック向けに求人IDで詳細を取得する。
 * @param jobId Job identifier string.
 * @param jobId 求人ID文字列。
 * @param apiBase Optional API base override.
 * @param apiBase オプションの API ベース指定。
 * @param signal Optional AbortSignal for cancellation.
 * @param signal キャンセル用のオプション AbortSignal。
 * @returns Promise resolving to a single JobDetailV2.
 * @returns 単一の JobDetailV2 を解決するプロミス。
 * @throws Error when jobId is empty or when the request fails.
 * @throws jobId が空、またはリクエスト失敗時にエラーをスロー。
 */
export async function fetchJobById(
  jobId: string,
  apiBase = "",
  signal?: AbortSignal
): Promise<JobDetailV2> {
  if (!jobId) {
    throw new Error("jobId is required to fetch job detail");
  }
  const url = buildApiUrl(`/api/jobs/${encodeURIComponent(jobId)}`, apiBase);
  return fetchJson<JobDetailV2>(url, { signal });
}

/**
 * @description Fetches structured job categories for filter UIs.
 * @description フィルターUI向けに構造化された求人カテゴリを取得する。
 * @param apiBase Optional API base override.
 * @param apiBase オプションの API ベース指定。
 * @param signal Optional AbortSignal for cancellation.
 * @param signal キャンセル用のオプション AbortSignal。
 * @returns Promise resolving to an array of job categories.
 * @returns 求人カテゴリ配列を解決するプロミス。
 * @throws Error when the request fails or the server responds with non-2xx.
 * @throws リクエスト失敗やサーバーが非2xxを返した場合にエラーをスロー。
 */
export async function fetchJobCategories(
  apiBase = "",
  signal?: AbortSignal
): Promise<JobCategory[]> {
  const url = buildApiUrl("/api/job-categories", apiBase);
  return fetchJson<JobCategory[]>(url, { signal });
}


