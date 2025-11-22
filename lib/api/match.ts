/**
 * @file lib/api/match.ts
 * @description API helpers for unified summary/detail matching and batch workflows.
 * @description サマリー/詳細マッチングおよびバッチ処理向け API ヘルパー。
 * @author Virginia Zhang
 * @remarks Designed for TanStack Query hooks and imperative calls in client/server components.
 * @remarks TanStack Query フックやクライアント/サーバーコンポーネントからの命令的呼び出し向け。
 */

import { buildApiUrl } from "@/lib/api/helpers";
import type { ApiRequestOptions } from "@/lib/api/types";
import { fetchJson } from "@/lib/fetcher";
import type {
    BaseRequestBody,
    DetailsEnvelope,
    MatchResultItem,
    SummaryEnvelope,
} from "@/types/matching";

/**
 * @description Common options for match API helpers.
 * @description マッチ API ヘルパー共通のオプション。
 */
export interface MatchApiOptions extends ApiRequestOptions {}

/**
 * @description Job payload used by batch matching endpoint.
 * @description バッチマッチングエンドポイントで使用される求人ペイロード。
 */
export interface BatchMatchJob {
  id: string;
  job_description: string;
}

/**
 * @description Request body for /api/match/batch.
 * @description /api/match/batch のリクエストボディ。
 */
export interface BatchMatchRequest {
  resume_text: string;
  jobs: BatchMatchJob[];
}

/**
 * @description Response payload from /api/match/batch.
 * @description /api/match/batch のレスポンスペイロード。
 */
export interface BatchMatchResponse {
  match_results: MatchResultItem[];
}

/**
 * @description Internal helper to POST to /api/match with a specific type.
 * @description 種別付きで /api/match に POST する内部ヘルパー。
 * @param type Match type segment ("summary" or "details").
 * @param type マッチタイプ（"summary" または "details"）。
 * @param body Request payload including jobId/resumeId/inputs.
 * @param body jobId/resumeId/inputs を含むリクエストペイロード。
 * @param options Optional request configuration.
 * @param options オプションのリクエスト設定。
 * @returns Promise resolving to the typed envelope.
 * @returns 型付けされたエンベロープを解決するプロミス。
 * @throws Error when body is invalid or network request fails.
 * @throws body が無効、またはネットワークリクエストが失敗した場合にエラー。
 */
async function postMatch<T>(
  type: "summary" | "details",
  body: BaseRequestBody,
  options: MatchApiOptions = {}
): Promise<T> {
  if (!body?.jobId || !body?.resumeId) {
    throw new Error("jobId and resumeId are required for matching");
  }
  if (!body.inputs?.job_description) {
    throw new Error("job_description is required for matching");
  }
  const url = buildApiUrl(`/api/match?type=${type}`, options.apiBase);
  return fetchJson<T>(url, {
    method: "POST",
    body: JSON.stringify(body),
    signal: options.signal,
    timeoutMs: options.timeoutMs,
  });
}

/**
 * @description Invokes summary matching workflow and returns structured scores.
 * @description サマリーマッチングワークフローを呼び出し、構造化スコアを返す。
 * @param body Request payload with job/resume identifiers and inputs.
 * @param body 求人/レジュメ識別子と入力を含むリクエストペイロード。
 * @param options Optional network configuration.
 * @param options オプションのネットワーク設定。
 * @returns Promise resolving to summary match envelope.
 * @returns サマリーマッチエンベロープを解決するプロミス。
 * @throws Error when validation or network fails.
 * @throws バリデーションまたはネットワーク失敗時にエラー。
 */
export function matchSummary(
  body: BaseRequestBody,
  options?: MatchApiOptions
): Promise<SummaryEnvelope> {
  return postMatch<SummaryEnvelope>("summary", body, options);
}

/**
 * @description Invokes detail matching workflow to retrieve advice and insights.
 * @description 詳細マッチングワークフローを呼び出し、アドバイスや洞察を取得する。
 * @param body Request payload with job/resume identifiers and inputs.
 * @param body 求人/レジュメ識別子と入力を含むリクエストペイロード。
 * @param options Optional network configuration.
 * @param options オプションのネットワーク設定。
 * @returns Promise resolving to detail match envelope.
 * @returns 詳細マッチエンベロープを解決するプロミス。
 * @throws Error when validation or network fails.
 * @throws バリデーションまたはネットワーク失敗時にエラー。
 */
export function matchDetails(
  body: BaseRequestBody,
  options?: MatchApiOptions
): Promise<DetailsEnvelope> {
  return postMatch<DetailsEnvelope>("details", body, options);
}

/**
 * @description Calls batch matching endpoint to evaluate multiple jobs sequentially.
 * @description バッチマッチングエンドポイントを呼び出し、複数求人を順次評価する。
 * @param payload Resume text plus job descriptions array.
 * @param payload レジュメテキストと求人記述の配列。
 * @param options Optional request configuration.
 * @param options オプションのリクエスト設定。
 * @returns Promise resolving to batch match results.
 * @returns バッチマッチ結果を解決するプロミス。
 * @throws Error when payload is invalid or network request fails.
 * @throws ペイロードが無効、またはネットワーク失敗時にエラー。
 */
export async function matchBatch(
  payload: BatchMatchRequest,
  options: MatchApiOptions = {}
): Promise<BatchMatchResponse> {
  if (!payload?.resume_text?.trim()) {
    throw new Error("resume_text is required for batch matching");
  }
  if (!payload.jobs?.length) {
    throw new Error("jobs array is required for batch matching");
  }
  const hasInvalidJob = payload.jobs.some(
    job => !job?.id || !job?.job_description
  );
  if (hasInvalidJob) {
    throw new Error("Each job must include id and job_description");
  }
  const url = buildApiUrl("/api/match/batch", options.apiBase);
  return fetchJson<BatchMatchResponse>(url, {
    method: "POST",
    body: JSON.stringify(payload),
    signal: options.signal,
    timeoutMs: options.timeoutMs,
  });
}


