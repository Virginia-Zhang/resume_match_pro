/**
 * @file helpers.ts
 * @description Shared helper utilities for API client modules (URL building, common types, etc.).
 * @description API クライアントモジュール向けの共通ヘルパー（URL構築や共通型など）。
 * @author Virginia Zhang
 * @remarks Runs on both server and client; relies on runtime config for base URL resolution.
 * @remarks サーバー/クライアント両対応で、ベースURL解決に runtime config を利用。
 */

import { getApiBase } from "@/lib/runtime-config";

/**
 * @description Build absolute or relative API URL depending on environment.
 * @description 実行環境に応じて絶対/相対の API URL を構築する。
 * @param path API path that may or may not include leading slash.
 * @param path 先頭スラッシュの有無を問わない API パス。
 * @param apiBase Optional base override; falls back to env/config when omitted.
 * @param apiBase 省略時は環境変数/設定にフォールバックするオプションのベースURL。
 * @returns Normalized URL (same-origin relative or absolute when base provided).
 * @returns 正規化されたURL（ベース指定時は絶対URL、同一オリジン時は相対パス）。
 */
export function buildApiUrl(path: string, apiBase?: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const base = getApiBase(apiBase)?.replace(/\/$/, "");
  return base ? `${base}${normalizedPath}` : normalizedPath;
}


