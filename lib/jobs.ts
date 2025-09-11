/**
 * @file jobs.ts
 * @description Utilities to derive list items from JobDetailV2 and fetch helpers.
 * @description JobDetailV2 から一覧用データを導出するユーティリティと取得ヘルパー。
 */
import type { JobListItem } from "@/types/jobs";
import type { JobDetailV2 } from "@/types/jobs_v2";
import { fetchJson } from "@/lib/fetcher";
import { getApiBase } from "@/lib/runtime-config";

export function toListItem(detail: JobDetailV2): JobListItem {
  return {
    id: detail.id,
    title: detail.title,
    company: detail.company,
    location: detail.location,
    tags: detail.tags,
    postedAt: detail.postedAt,
    logoUrl: detail.logoUrl,
  };
}

export async function fetchJobs(apiBase = ""): Promise<JobDetailV2[]> {
  const base = getApiBase(apiBase);
  const url = `${base}/api/jobs`;
  return fetchJson<JobDetailV2[]>(url);
}

export async function fetchJobById(
  id: string,
  apiBase = ""
): Promise<JobDetailV2 | null> {
  const base = getApiBase(apiBase);
  const url = `${base}/api/jobs/${encodeURIComponent(id)}`;
  try {
    return await fetchJson<JobDetailV2>(url);
  } catch {
    return null;
  }
}
