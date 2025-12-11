/**
 * @file instrumentation.node.ts
 * @description Node.js-specific initialization logic (not executed in Edge Runtime).
 * @description Node.js 専用の初期化ロジック（Edge Runtime では実行されない）。
 * @author Virginia Zhang
 * @remarks This file contains Node.js-specific APIs that are not compatible with Edge Runtime.
 * @remarks このファイルには Edge Runtime と互換性のない Node.js 専用 API が含まれています。
 */

/**
 * @description Register global error handlers for uncaught exceptions and promise rejections.
 * @description キャッチされない例外と Promise 拒否用のグローバルエラーハンドラーを登録。
 * @remarks This function uses Node.js-specific process.on() API.
 * @remarks この関数は Node.js 専用の process.on() API を使用します。
 */
export function registerNodeErrorHandlers(): void {
  // Handle uncaught exceptions
  // キャッチされない例外を処理
  process.on("uncaughtException", (error) => {
    console.error("[Node.js] Uncaught exception:", {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
  });

  // Handle unhandled promise rejections
  // 未処理の Promise 拒否を処理
  process.on("unhandledRejection", (reason) => {
    console.error("[Node.js] Unhandled rejection:", {
      timestamp: new Date().toISOString(),
      error: reason instanceof Error ? reason.message : String(reason),
      stack: reason instanceof Error ? (reason).stack : undefined,
    });
  });
}


