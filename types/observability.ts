/**
 * @file observability.ts
 * @description TypeScript type definitions for logging and observability events.
 * @description ロギングとオブザーバビリティイベント用の TypeScript 型定義。
 * @author Virginia Zhang
 * @remarks Provides type-safe event schemas for batch matching, single matching, and upload operations.
 * @remarks バッチマッチング、シングルマッチング、アップロード操作の型安全なイベントスキーマを提供します。
 */

/**
 * @description Log level types for structured logging.
 * @description 構造化ログのログレベルタイプ。
 */
export type LogLevel = "info" | "warn" | "error";

/**
 * @description Base structure for all log events.
 * @description すべてのログイベント用のベース構造。
 */
export interface BaseLogEvent {
  /** Unique identifier for the request / リクエストの一意識別子 */
  requestId: string;
  /** Anonymous user ID from browser / ブラウザからの匿名ユーザー ID */
  anonymousId?: string;
  /** Event timestamp in ISO 8601 format / ISO 8601 形式のイベントタイムスタンプ */
  timestamp: string;
  /** Log level / ログレベル */
  level: LogLevel;
}

/**
 * @description Event data for batch matching operations.
 * @description バッチマッチング操作のイベントデータ。
 */
export interface BatchMatchEvent extends BaseLogEvent {
  /** Resume ID / レジュメ ID */
  resumeId: string;
  /** Total number of jobs to match / マッチングする求人の総数 */
  jobCount: number;
  /** Hash of resume text for cache invalidation / キャッシュ無効化用のレジュメテキストハッシュ */
  resumeHash?: string;
}

/**
 * @description Event data for batch match completion with statistics.
 * @description 統計情報を含むバッチマッチ完了イベントデータ。
 */
export interface BatchMatchCompletedEvent extends BatchMatchEvent {
  /** Number of jobs from cache / キャッシュからの求人数 */
  cachedJobs: number;
  /** Number of jobs requiring computation / 計算が必要な求人数 */
  computedJobs: number;
  /** Number of failed jobs (if applicable) / 失敗した求人数（該当する場合） */
  failedJobs?: number;
  /** Cache hit rate (0-1) / キャッシュヒット率 (0-1) */
  cacheHitRate: number;
  /** Total operation latency in milliseconds / 合計動作レイテンシ（ミリ秒） */
  latencyMs: number;
  /** Number of Dify API calls / Dify API 呼び出し回数 */
  difyCallCount: number;
  /** Average Dify API latency in milliseconds / 平均 Dify API レイテンシ（ミリ秒） */
  avgDifyLatencyMs: number;
}

/**
 * @description Event data for batch match failure.
 * @description バッチマッチ失敗イベントデータ。
 */
export interface BatchMatchFailedEvent extends BatchMatchEvent {
  /** Error message / エラーメッセージ */
  error: string;
  /** Latency before failure in milliseconds / 失敗までのレイテンシ（ミリ秒） */
  latencyMs?: number;
}

/**
 * @description Event data for single job matching (scoring).
 * @description シングル求人マッチング (スコアリング) イベントデータ。
 */
export interface SingleMatchScoringEvent extends BaseLogEvent {
  /** Job ID / 求人 ID */
  jobId: string;
  /** Resume ID / レジュメ ID */
  resumeId: string;
  /** Job description length / 求人説明の長さ */
  jobDescriptionLength?: number;
}

/**
 * @description Event data for single match scoring completion.
 * @description シングルマッチスコアリング完了イベントデータ。
 */
export interface SingleMatchScoringCompletedEvent
  extends SingleMatchScoringEvent {
  /** Whether result was from cache / 結果がキャッシュからのもの */
  fromCache: boolean;
  /** Overall match score (0-100) / 全体的なマッチスコア (0-100) */
  overallScore: number;
  /** Latency in milliseconds / レイテンシ（ミリ秒） */
  latencyMs: number;
}

/**
 * @description Event data for single match details request.
 * @description シングルマッチ詳細リクエストイベントデータ。
 */
export interface SingleMatchDetailsEvent extends BaseLogEvent {
  /** Job ID / 求人 ID */
  jobId: string;
  /** Resume ID / レジュメ ID */
  resumeId: string;
  /** Overall score used to request details / 詳細を要求するために使用される全体スコア */
  overallScore: number;
}

/**
 * @description Event data for single match details completion.
 * @description シングルマッチ詳細完了イベントデータ。
 */
export interface SingleMatchDetailsCompletedEvent
  extends SingleMatchDetailsEvent {
  /** Whether result was from cache / 結果がキャッシュからのもの */
  fromCache: boolean;
  /** Latency in milliseconds / レイテンシ（ミリ秒） */
  latencyMs: number;
  /** Dify API latency in milliseconds (for non-cached results) / Dify API レイテンシ（ミリ秒）（キャッシュ以外の結果） */
  difyLatencyMs?: number;
}

/**
 * @description Event data for resume upload operation.
 * @description 簡歴アップロード操作のイベントデータ。
 */
export interface ResumeUploadEvent extends BaseLogEvent {
  /** File type (PDF, text) / ファイルタイプ (PDF, テキスト) */
  fileType: string;
  /** File size in bytes / ファイルサイズ（バイト） */
  fileSize: number;
}

/**
 * @description Event data for resume upload completion.
 * @description 簡歴アップロード完了イベントデータ。
 */
export interface ResumeUploadCompletedEvent extends ResumeUploadEvent {
  /** Resume ID assigned by system / システムによって割り当てられたレジュメ ID */
  resumeId: string;
  /** Latency in milliseconds / レイテンシ（ミリ秒） */
  latencyMs: number;
}

/**
 * @description Event data for resume upload failure.
 * @description 簡歴アップロード失敗イベントデータ。
 */
export interface ResumeUploadFailedEvent extends ResumeUploadEvent {
  /** Error message / エラーメッセージ */
  error: string;
  /** Latency before failure in milliseconds / 失敗までのレイテンシ（ミリ秒） */
  latencyMs?: number;
}

/**
 * @description Union type for all possible log events.
 * @description すべての可能なログイベントの和集合型。
 */
export type LogEventData =
  | BatchMatchEvent
  | BatchMatchCompletedEvent
  | BatchMatchFailedEvent
  | SingleMatchScoringEvent
  | SingleMatchScoringCompletedEvent
  | SingleMatchDetailsEvent
  | SingleMatchDetailsCompletedEvent
  | ResumeUploadEvent
  | ResumeUploadCompletedEvent
  | ResumeUploadFailedEvent;

/**
 * @description Function signature for logging.
 * @description ロギング関数のシグネチャ。
 */
export type LogFunction = (
  level: LogLevel,
  event: string,
  data: Partial<LogEventData>
) => void;

/**
 * @description Configuration for the logger.
 * @description ロガーの設定。
 */
export interface LoggerConfig {
  /** Whether to output to console / コンソールに出力するかどうか */
  enableConsole?: boolean;
  /** Whether to output to file (server-only) / ファイルに出力するかどうか（サーバーのみ） */
  enableFile?: boolean;
  /** Log directory path / ログディレクトリパス */
  logDir?: string;
  /** Log file name / ログファイル名 */
  logFileName?: string;
}


