/**
 * @file sentry.config.ts
 * @description Shared Sentry configuration utilities for both client and server-side initialization.
 * @description クライアント・サーバーサイド初期化用の共有 Sentry 設定ユーティリティ。
 * @author Virginia Zhang
 * @remarks Extracts common configuration logic to avoid duplication between client and server configs.
 * @remarks クライアント・サーバー設定間の重複を避けるため、共通設定ロジックを抽出します。
 */

/**
 * @description Get Sentry configuration from environment variables
 * @description 環境変数から Sentry 設定を取得
 * @returns Sentry configuration object
 * @returns Sentry 設定オブジェクト
 */
export interface SentryConfig {
  /** Data Source Name for Sentry / Sentry 用データソース名 */
  dsn: string | undefined;
  /** Application environment / アプリケーション環境 */
  environment: string;
  /** Trace sample rate (0-1) / トレースサンプルレート (0-1) */
  tracesSampleRate: number;
}

/**
 * @description Parse and return Sentry configuration from environment
 * @description 環境から Sentry 設定をパースして返す
 * @returns Parsed Sentry configuration
 * @returns パースされた Sentry 設定
 */
export function getSentryConfig(): SentryConfig {
  return {
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: Number.parseFloat(
      process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE || "0.5"
    ),
  };
}

/**
 * @description Validate that Sentry DSN is configured
 * @description Sentry DSN が設定されていることを検証
 * @param dsn DSN from environment
 * @param dsn 環境から得た DSN
 * @returns true if DSN is configured, false otherwise
 * @returns DSN が設定されている場合は true、そうでない場合は false
 */
export function validateSentryDsn(dsn: string | undefined): boolean {
  if (!dsn) {
    console.warn("[Sentry] NEXT_PUBLIC_SENTRY_DSN not configured, Sentry disabled");
    return false;
  }
  return true;
}

/**
 * @description Mask DSN for safe logging
 * @description ログ出力用に DSN をマスク
 * @param dsn Full DSN string
 * @param dsn 完全な DSN 文字列
 * @returns Masked DSN (e.g., "https://abc@****")
 * @returns マスクされた DSN (例: "https://abc@****")
 */
export function maskDsnForLogging(dsn: string): string {
  return dsn.split("@")[0] + "@****";
}


