/**
 * @file batch-match-cache.ts
 * @description sessionStorage cache for batch matching runtime metadata (results are stored in database).
 * @description バッチマッチングの実行時メタデータ用 sessionStorage キャッシュ（結果はデータベースに保存）。
 * @author Virginia Zhang
 * @remarks Client-only module; stores only runtime state, not results.
 * @remarks クライアント専用モジュール。結果ではなく実行時状態のみを保存。
 */

const CACHE_KEY = "resume-batch-match-metadata";

/**
 * @description Metadata entry structure stored in sessionStorage.
 * @description sessionStorage に保存されるメタデータエントリの構造。
 */
interface BatchMatchMetadataEntry {
  resumeId: string;
  isComplete: boolean;
  processedJobs: number;
  totalJobs: number;
  timestamp: number;
}

/**
 * @description Check if running in browser environment.
 * @description ブラウザ環境で実行中かどうかを確認。
 */
function isBrowser(): boolean {
  return (
    globalThis.window !== undefined && globalThis.sessionStorage !== undefined
  );
}

/**
 * @description Cached batch match metadata structure.
 * @description キャッシュされたバッチマッチメタデータの構造。
 */
export interface CachedBatchMatchMetadata {
  isComplete: boolean;
  processedJobs: number;
  totalJobs: number;
}

/**
 * @description Load batch match metadata from sessionStorage.
 * @description sessionStorage からバッチマッチングメタデータを読み込む。
 * @param resumeId Resume ID to match against cached data.
 * @param resumeId キャッシュデータと照合するレジュメID。
 * @returns Cached metadata object or null if not found.
 * @returns キャッシュされたメタデータオブジェクト、または見つからない場合は null。
 */
export function loadBatchMatchMetadata(
  resumeId: string
): CachedBatchMatchMetadata | null {
  if (!isBrowser() || !resumeId) {
    return null;
  }

  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) {
      return null;
    }

    const entry: BatchMatchMetadataEntry = JSON.parse(raw);

    // Validate resumeId matches
    // resumeId が一致するか検証
    if (entry.resumeId !== resumeId) {
      return null;
    }

    return {
      isComplete: entry.isComplete ?? false,
      processedJobs: entry.processedJobs ?? 0,
      totalJobs: entry.totalJobs ?? 0,
    };
  } catch (error) {
    console.warn("Failed to load batch match metadata:", error);
    return null;
  }
}

/**
 * @description Save batch match metadata to sessionStorage.
 * @description sessionStorage にバッチマッチングメタデータを保存。
 * @param resumeId Resume ID associated with the metadata.
 * @param resumeId メタデータに関連付けられたレジュメID。
 * @param isComplete Whether matching is complete.
 * @param isComplete マッチングが完了しているかどうか。
 * @param processedJobs Number of processed jobs.
 * @param processedJobs 処理済みの求人数。
 * @param totalJobs Total number of jobs.
 * @param totalJobs 求人の総数。
 */
export function saveBatchMatchMetadata(
  resumeId: string,
  isComplete: boolean,
  processedJobs: number,
  totalJobs: number
): void {
  if (!isBrowser() || !resumeId) {
    return;
  }

  try {
    const entry: BatchMatchMetadataEntry = {
      resumeId,
      isComplete,
      processedJobs,
      totalJobs,
      timestamp: Date.now(),
    };

    sessionStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch (error) {
    console.warn("Failed to save batch match metadata:", error);
  }
}

/**
 * @description Clear batch match metadata from sessionStorage.
 * @description sessionStorage からバッチマッチングメタデータをクリア。
 */
export function clearBatchMatchMetadata(): void {
  if (!isBrowser()) {
    return;
  }

  try {
    sessionStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.warn("Failed to clear batch match metadata:", error);
  }
}
