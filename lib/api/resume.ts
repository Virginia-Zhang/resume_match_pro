/**
 * @file lib/api/resume.ts
 * @description Client helpers for resume parsing, storage, and retrieval endpoints.
 * @description レジュメ解析・保存・取得エンドポイント向けのクライアントヘルパー。
 * @author Virginia Zhang
 * @remarks Runs on client (File uploads) or server (SSR prefetch) without exposing secrets.
 * @remarks 秘匿情報を公開せず、クライアント（ファイルアップロード）/サーバー（SSRプリフェッチ）両対応。
 */

import { buildApiUrl } from "@/lib/api/helpers";
import type { ApiRequestOptions } from "@/lib/api/types";
import { fetchJson, fetchWithTimeout } from "@/lib/fetcher";

/**
 * @description Common options for resume API helpers.
 * @description レジュメ API ヘルパー共通のオプション。
 */
export interface ResumeApiOptions extends ApiRequestOptions {}

/**
 * @description Response payload from /api/parse.
 * @description /api/parse のレスポンスペイロード。
 */
export interface ParsePdfResponse {
  resumeText: string;
}

/**
 * @description Response payload from /api/resume.
 * @description /api/resume のレスポンスペイロード。
 */
export interface ResumeUploadResponse {
  resumeId: string;
  resumeHash: string;
}

/**
 * @description Response payload from /api/resume-text.
 * @description /api/resume-text のレスポンスペイロード。
 */
export interface ResumeTextResponse {
  resumeId: string;
  resumeKey: string;
  resumeText: string;
}

/**
 * @description Uploads a PDF file to /api/parse and returns parsed text.
 * @description PDF ファイルを /api/parse に送信し、解析されたテキストを取得する。
 * @param file PDF file selected by the user.
 * @param file ユーザーが選択した PDF ファイル。
 * @param options Optional request configuration (base URL, signal, timeout).
 * @param options オプションのリクエスト設定（ベースURL、シグナル、タイムアウト）。
 * @returns Promise resolving to resume text payload.
 * @returns レジュメテキストを含むペイロードを解決するプロミス。
 * @throws Error when the file is invalid or the API returns non-2xx.
 * @throws ファイルが無効、または API が非2xxを返した場合にエラーをスロー。
 */
export async function parsePdf(
  file: File,
  options: ResumeApiOptions = {}
): Promise<ParsePdfResponse> {
  if (!(file instanceof File)) {
    throw new TypeError("A valid File instance is required for PDF parsing");
  }
  const formData = new FormData();
  formData.append("file", file);
  const url = buildApiUrl("/api/parse", options.apiBase);
  const response = await fetchWithTimeout(url, {
    method: "POST",
    body: formData,
    signal: options.signal,
    timeoutMs: options.timeoutMs,
  });
  const payload = (await response.json()) as ParsePdfResponse & { error?: string };
  if (!response.ok) {
    throw new Error(payload.error || "Failed to parse PDF");
  }
  if (!payload.resumeText) {
    throw new Error("Parse API returned empty resume text");
  }
  return { resumeText: payload.resumeText };
}

/**
 * @description Persists resume text through /api/resume and returns identifiers.
 * @description /api/resume を通じてレジュメテキストを保存し、識別子を返す。
 * @param resumeText Plain text to store in S3 via API route.
 * @param resumeText API ルート経由で S3 に保存するプレーンテキスト。
 * @param options Optional request configuration.
 * @param options オプションのリクエスト設定。
 * @returns Promise resolving to resumeId and resumeHash.
 * @returns resumeId と resumeHash を解決するプロミス。
 * @throws Error when resumeText is empty or the server rejects the request.
 * @throws resumeText が空、またはサーバーがリクエストを拒否した場合にエラー。
 */
export async function uploadResume(
  resumeText: string,
  options: ResumeApiOptions = {}
): Promise<ResumeUploadResponse> {
  if (!resumeText?.trim()) {
    throw new Error("resumeText is required to upload resume");
  }
  const url = buildApiUrl("/api/resume", options.apiBase);
  return fetchJson<ResumeUploadResponse>(url, {
    method: "POST",
    body: JSON.stringify({ resume_text: resumeText }),
    signal: options.signal,
    timeoutMs: options.timeoutMs,
  });
}

/**
 * @description Fetches stored resume text by resumeId via /api/resume-text.
 * @description /api/resume-text を通じて resumeId で保存済みレジュメテキストを取得する。
 * @param resumeId Resume identifier returned from upload API.
 * @param resumeId アップロード API から返されたレジュメ ID。
 * @param options Optional request configuration.
 * @param options オプションのリクエスト設定。
 * @returns Promise resolving to resume text along with metadata.
 * @returns レジュメテキストとメタデータを解決するプロミス。
 * @throws Error when resumeId is missing or the API request fails.
 * @throws resumeId が欠如、または API リクエストが失敗した場合にエラー。
 */
export async function fetchResumeText(
  resumeId: string,
  options: ResumeApiOptions = {}
): Promise<ResumeTextResponse> {
  if (!resumeId) {
    throw new Error("resumeId is required to fetch resume text");
  }
  const url = buildApiUrl(
    `/api/resume-text?resumeId=${encodeURIComponent(resumeId)}`,
    options.apiBase
  );
  return fetchJson<ResumeTextResponse>(url, {
    signal: options.signal,
    timeoutMs: options.timeoutMs,
  });
}


