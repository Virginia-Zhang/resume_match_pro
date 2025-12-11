/**
 * @file sentry.server.config.ts
 * @description Sentry SDK initialization for server-side error tracking and performance monitoring.
 * @description サーバーサイドエラートラッキングとパフォーマンス監視用の Sentry SDK 初期化。
 * @author Virginia Zhang
 * @remarks Initializes Sentry with performance monitoring for server-side operations.
 * @remarks サーバーサイド操作用のパフォーマンス監視を有効にして Sentry を初期化。
 */

import * as Sentry from "@sentry/nextjs";
import {
  getSentryConfig,
  maskDsnForLogging,
  validateSentryDsn,
} from "@/sentry.config";

/**
 * @description Initialize Sentry for server-side tracking
 * @description サーバーサイドトラッキング用に Sentry を初期化
 */
export function initializeServerSentry(): void {
  const { dsn, environment, tracesSampleRate } = getSentryConfig();

  if (!validateSentryDsn(dsn)) {
    return;
  }

  Sentry.init({
    dsn,
    environment,
    tracesSampleRate,

    // Capture uncaught exceptions
    // キャッチされない例外をキャプチャ
    attachStacktrace: true,

    // Allow URL paths to be sanitized
    // URL パスをサニタイズ可能にする
    denyUrls: [
      // Ignore errors from browser extensions
      // ブラウザ拡張機能のエラーを無視
      /chrome-extension:\/\//i,
      /moz-extension:\/\//i,
    ],

    // Note: Sentry Next.js SDK automatically includes default integrations
    // 注意: Sentry Next.js SDK はデフォルトのインテグレーションを自動的に含みます
    // No need to manually add onUncaughtExceptionIntegration or onUnhandledRejectionIntegration
    // onUncaughtExceptionIntegration や onUnhandledRejectionIntegration を手動追加する必要はありません
  });

  console.debug("[Sentry] Server-side Sentry initialized", {
    dsn: maskDsnForLogging(dsn!),
    environment,
    tracesSampleRate,
  });
}

