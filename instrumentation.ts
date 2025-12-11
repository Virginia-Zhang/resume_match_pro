/**
 * @file instrumentation.ts
 * @description Next.js initialization hook for server-side setup of monitoring and logging.
 * @description 監視とログ記録のサーバーサイド設定用の Next.js 初期化フック。
 * @author Virginia Zhang
 * @remarks This file is automatically called by Next.js during server initialization.
 * @remarks このファイルはサーバー初期化中に Next.js によって自動的に呼び出されます。
 */

import { initializeServerSentry } from "@/sentry.server.config";

/**
 * @description Called by Next.js during application initialization (server-side only).
 * @description アプリケーション初期化中に Next.js によって呼び出されます（サーバーサイドのみ）。
 * @remarks This is the entry point for all server-side initialization logic.
 * @remarks これはすべてのサーバーサイド初期化ロジックのエントリーポイントです。
 */
export async function register(): Promise<void> {
  // Check if running in Edge Runtime
  // Edge Runtime で実行されているかチェック
  const isEdgeRuntime = process.env.NEXT_RUNTIME === "edge";

  try {
    // Initialize Sentry for server-side error tracking
    // サーバーサイドエラートラッキング用に Sentry を初期化
    initializeServerSentry();

    // Handle Edge Runtime separately (limited API support)
    // Edge Runtime を個別に処理（API サポートが制限されている）
    if (isEdgeRuntime) {
      // Edge Runtime: use console only
      // Edge Runtime: コンソールのみ使用
      console.info("[Instrumentation] Initialized (Edge Runtime)", {
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Load Node.js-specific modules in Node.js runtime
    // Node.js ランタイムで Node.js 専用モジュールを読み込み
    // Dynamic import logger to avoid Edge Runtime issues
    // Edge Runtime 問題を回避するため logger を動的インポート
    const { logger } = await import("@/lib/logging/logger");
    
    logger.info("instrumentation_initialized", {
      timestamp: new Date().toISOString(),
    });

    // Dynamic import to avoid Edge Runtime static analysis
    // Edge Runtime の静的解析を回避するため動的インポート
    const { registerNodeErrorHandlers } = await import("@/instrumentation.node");
    registerNodeErrorHandlers();

    logger.info("instrumentation_completed", {
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // Log initialization error
    // 初期化エラーをログに記録
    if (isEdgeRuntime) {
      console.error("[Instrumentation] Failed (Edge Runtime)", {
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error),
      });
      return;
    }

    // Node.js runtime error logging
    // Node.js ランタイムエラーログ
    try {
      const { logger } = await import("@/lib/logging/logger");
      logger.error("instrumentation_failed", {
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error),
      });
    } catch {
      console.error("[Instrumentation] Failed", {
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

