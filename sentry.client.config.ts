/**
 * @file sentry.client.config.ts
 * @description Sentry SDK initialization for client-side error tracking and performance monitoring.
 * @description クライアントサイドエラートラッキングとパフォーマンス監視用の Sentry SDK 初期化。
 * @author Virginia Zhang
 * @remarks Initializes Sentry with performance monitoring enabled at 50% sample rate in development.
 * @remarks 開発環境で 50% のサンプルレートでパフォーマンス監視を有効にして Sentry を初期化。
 */

import * as Sentry from "@sentry/nextjs";
import { getOrCreateAnonymousId } from "@/lib/analytics/ids";
import {
  getSentryConfig,
  maskDsnForLogging,
  validateSentryDsn,
} from "@/sentry.config";

/**
 * @description Initialize Sentry for client-side tracking
 * @description クライアントサイドトラッキング用に Sentry を初期化
 */
export function initializeClientSentry(): void {
  const { dsn, environment, tracesSampleRate } = getSentryConfig();

  if (!validateSentryDsn(dsn)) {
    return;
  }

  Sentry.init({
    dsn,
    environment,
    tracesSampleRate,

    // Set anonymous user ID for tracking
    // トラッキング用に匿名ユーザー ID を設定
    initialScope: {
      user: {
        id: getOrCreateAnonymousId(),
      },
    },

    // Configure integrations
    // インテグレーションの設定
    integrations: [
      // Browser tracing
      // ブラウザトレーシング
      Sentry.browserTracingIntegration(),
      // Session replay (10% of sessions, 100% on error)
      // セッションリプレイ (10% のセッション、エラー時 100%)
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
        maskAllInputs: true,
      }),
    ],

    // Session replay configuration
    // セッションリプレイ設定
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1, // 100% of errors

    // Capture uncaught exceptions and unhandled promise rejections
    // キャッチされない例外と未処理の Promise 拒否をキャプチャ
    attachStacktrace: true,

    // Ignore certain errors
    // 特定のエラーを無視
    beforeSend(event, hint) {
      // Ignore browser extensions errors
      // ブラウザ拡張機能のエラーを無視
      if (event.exception) {
        const error = hint.originalException;
        if (error instanceof Error) {
          if (error.message.includes("chrome-extension://")) {
            return null;
          }
        }
      }
      return event;
    },
  });

  console.debug("[Sentry] Client-side Sentry initialized", {
    dsn: maskDsnForLogging(dsn!),
    environment,
    tracesSampleRate,
  });
}

