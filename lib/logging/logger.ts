/**
 * @file logger.ts
 * @description Core logging system that outputs to console and local file (server-side only).
 * @description コンソールとローカルファイル（サーバー側のみ）に出力するコアロギングシステム。
 * @author Virginia Zhang
 * @remarks Implements structured JSON logging with dual output targets for both development and production.
 * @remarks 開発環境と本番環境の両方に対応する構造化 JSON ログの二重出力を実装します。
 */

import type {
  LogEventData,
  LogLevel,
} from "@/types/observability";

// Conditionally import Node.js modules (not available in Edge Runtime)
// Node.js モジュールの条件付きインポート（Edge Runtime では利用不可）
let fs: typeof import("node:fs") | null = null;
let path: typeof import("node:path") | null = null;

try {
  if (typeof globalThis !== "undefined" && !("window" in globalThis) && process.env.NEXT_RUNTIME !== "edge") {
    // Safe to import Node.js modules in Node.js runtime
    // Node.js ランタイムでは安全に Node.js モジュールをインポート
    fs = require("node:fs");
    path = require("node:path");
  }
} catch {
  // Silently fail if imports are not available (Edge Runtime)
  // インポートが利用不可の場合は静かに失敗（Edge Runtime）
}

/**
 * @description Logger configuration
 * @description ロガー設定
 */
interface LoggerOptions {
  /** Enable console output / コンソール出力を有効にする */
  enableConsole?: boolean;
  /** Enable file output (server-only) / ファイル出力を有効にする（サーバーのみ） */
  enableFile?: boolean;
  /** Log directory path / ログディレクトリパス */
  logDir?: string;
  /** Log file name / ログファイル名 */
  logFileName?: string;
}

/**
 * @description Logger class for structured logging
 * @description 構造化ログ用のロガークラス
 */
class Logger {
  private readonly enableConsole: boolean;
  private readonly enableFile: boolean;
  private readonly logDir: string;
  private readonly logFileName: string;

  /**
   * @description Initialize logger with options
   * @description オプション付きでロガーを初期化
   * @param options Logger configuration options
   * @param options ロガー設定オプション
   */
  constructor(options: LoggerOptions = {}) {
    this.enableConsole = options.enableConsole ?? true;
    this.enableFile = options.enableFile ?? true;
    // Use provided logDir or default (Edge Runtime safe - no process.cwd())
    // 提供されたログディレクトリを使用、またはデフォルト（Edge Runtime 安全）
    this.logDir = options.logDir ?? "logs";
    this.logFileName = options.logFileName ?? "app-development.log";
  }

  /**
   * @description Get absolute log directory path
   * @description 絶対ログディレクトリパスを取得
   * @returns Absolute log directory path
   * @returns 絶対ログディレクトリパス
   */
  private getAbsoluteLogDir(): string {
    // Return as-is if already absolute or in Edge Runtime
    // 既に絶対パスまたは Edge Runtime の場合はそのまま返す
    if (!path || this.logDir.startsWith("/") || /^[A-Z]:/i.exec(this.logDir)) {
      return this.logDir;
    }
    // Resolve relative path in Node.js runtime
    // Node.js ランタイムで相対パスを解決
    try {
      return path.join(process.cwd(), this.logDir);
    } catch {
      return this.logDir;
    }
  }

  /**
   * @description Ensure logs directory exists (called before each write)
   * @description ログディレクトリが存在することを確認（各書き込みの前に呼び出し）
   */
  private ensureLogDir(): void {
    // Only attempt to create directory on server-side with Node.js runtime
    // Node.js ランタイムのみでディレクトリ作成を試みる
    if (globalThis.window !== undefined || !fs) {
      return;
    }

    try {
      const absoluteDir = this.getAbsoluteLogDir();
      if (!fs.existsSync(absoluteDir)) {
        fs.mkdirSync(absoluteDir, { recursive: true });
      }
    } catch (error) {
      // Silently fail if unable to create directory
      // ディレクトリ作成に失敗した場合は静かに失敗
      if (error instanceof Error) {
        console.error("[Logger] Failed to create log directory:", error.message);
      }
    }
  }

  /**
   * @description Write log entry to file
   * @description ログエントリをファイルに書き込み
   * @param entry Log entry as JSON string
   * @param entry JSON 文字列としてのログエントリ
   */
  private writeToFile(entry: string): void {
    // Only write to file on server-side with Node.js runtime
    // Node.js ランタイムのみでファイルに書き込み
    if (globalThis.window !== undefined || !fs || !path) {
      return;
    }

    if (!this.enableFile) {
      return;
    }

    try {
      this.ensureLogDir();
      const absoluteDir = this.getAbsoluteLogDir();
      const filePath = path.join(absoluteDir, this.logFileName);
      fs.appendFileSync(filePath, entry + "\n", "utf-8");
    } catch (error) {
      // Log to console if file write fails, but don't crash the app
      // ファイル書き込みに失敗した場合はコンソールにログを記録するが、アプリを崩さない
      if (this.enableConsole && error instanceof Error) {
        console.error("[Logger] Failed to write to log file:", error.message);
      }
    }
  }

  /**
   * @description Write log entry to console
   * @description ログエントリをコンソールに書き込み
   * @param entry Log entry object
   * @param entry ログエントリオブジェクト
   */
  private writeToConsole(
    entry: Record<string, unknown>,
    level: LogLevel
  ): void {
    if (!this.enableConsole) {
      return;
    }

    let logMethod: typeof console.log;
    switch (level) {
      case "error":
        logMethod = console.error;
        break;
      case "warn":
        logMethod = console.warn;
        break;
      default:
        logMethod = console.log;
        break;
    }

    logMethod(`[${level.toUpperCase()}]`, JSON.stringify(entry));
  }

  /**
   * @description Format and output a log entry
   * @description ログエントリをフォーマットして出力
   * @param level Log level (info, warn, error)
   * @param level ログレベル (info, warn, error)
   * @param event Event name
   * @param event イベント名
   * @param data Additional event data
   * @param data 追加のイベントデータ
   */
  public log(
    level: LogLevel,
    event: string,
    data: Partial<LogEventData> = {}
  ): void {
    try {
      // Build log entry
      // ログエントリを構築
      const entry = {
        timestamp: new Date().toISOString(),
        level,
        event,
        ...data,
      };

      // Convert to JSON string
      // JSON 文字列に変換
      const jsonString = JSON.stringify(entry);

      // Write to both targets
      // 両方のターゲットに書き込み
      this.writeToConsole(entry, level);
      this.writeToFile(jsonString);
    } catch (error) {
      // If all else fails, at least try console.error
      // すべてが失敗した場合は、少なくとも console.error を試す
      if (error instanceof Error) {
        console.error("[Logger] Logging failed:", error.message);
      }
    }
  }

  /**
   * @description Log an info-level event
   * @description info レベルイベントをログに記録
   * @param event Event name
   * @param event イベント名
   * @param data Event data
   * @param data イベントデータ
   */
  public info(event: string, data?: Partial<LogEventData>): void {
    this.log("info", event, data);
  }

  /**
   * @description Log a warning-level event
   * @description warn レベルイベントをログに記録
   * @param event Event name
   * @param event イベント名
   * @param data Event data
   * @param data イベントデータ
   */
  public warn(event: string, data?: Partial<LogEventData>): void {
    this.log("warn", event, data);
  }

  /**
   * @description Log an error-level event
   * @description error レベルイベントをログに記録
   * @param event Event name
   * @param event イベント名
   * @param data Event data
   * @param data イベントデータ
   */
  public error(event: string, data?: Partial<LogEventData>): void {
    this.log("error", event, data);
  }
}

/**
 * @description Global logger instance
 * @description グローバルロガーインスタンス
 */
export const logger = new Logger({
  enableConsole: true,
  enableFile: process.env.NODE_ENV === "development", // Only log to file in development
  // 開発環境でのみファイルにログ
  logDir: "logs", // Relative path, resolved at runtime
  // 相対パス、実行時に解決
  logFileName: "app-development.log",
});

/**
 * @description Re-export logger type and interfaces
 * @description ロガー型とインターフェースを再エクスポート
 */
export type { LoggerOptions };
export { Logger };

