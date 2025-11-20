/**
 * @file types.ts
 * @description Shared TypeScript interfaces for API client helpers (options, configs, etc.).
 * @description API クライアントヘルパー用の共有 TypeScript インターフェース（オプションや設定など）。
 * @author Virginia Zhang
 * @remarks Used by both client and server modules to keep request options consistent.
 * @remarks リクエストオプションの一貫性を保つためにクライアント/サーバーモジュール双方で使用。
 */

import type { TimeoutOptions } from "@/lib/fetcher";

/**
 * @description Common request options shared by API helpers (timeout, abort signal, base override).
 * @description API ヘルパー間で共有するリクエストオプション（タイムアウト、AbortSignal、ベースURLの上書き）。
 */
export interface ApiRequestOptions
  extends Pick<TimeoutOptions, "signal" | "timeoutMs"> {
  apiBase?: string;
}


