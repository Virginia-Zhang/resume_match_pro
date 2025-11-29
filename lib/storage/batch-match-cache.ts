/**
 * @file batch-match-cache.ts
 * @description Simple sessionStorage cache for batch matching results.
 * @description バッチマッチング結果用のシンプルな sessionStorage キャッシュ。
 * @author Virginia Zhang
 * @remarks Client-only module; provides clean data structure without TanStack Query overhead.
 * @remarks クライアント専用モジュール。TanStack Query のオーバーヘッドなしでクリーンなデータ構造を提供。
 */

import type { MatchResultItem } from "@/types/matching";

const CACHE_KEY = "resume-batch-match-cache";

/**
 * @description Cache entry structure stored in sessionStorage.
 * @description sessionStorage に保存されるキャッシュエントリの構造。
 */
interface BatchMatchCacheEntry {
  resumeId: string;
  results: MatchResultItem[];
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
 * @description Load batch match results from sessionStorage.
 * @description sessionStorage からバッチマッチング結果を読み込む。
 * @param resumeId Resume ID to match against cached data.
 * @param resumeId キャッシュデータと照合するレジュメID。
 * @returns Cached results array or null if not found/expired.
 * @returns キャッシュされた結果配列、または見つからない/期限切れの場合は null。
 */
export function loadBatchMatchCache(
  resumeId: string
): MatchResultItem[] | null {
  if (!isBrowser() || !resumeId) {
    return null;
  }

  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) {
      return null;
    }

    const entry: BatchMatchCacheEntry = JSON.parse(raw);

    // Validate resumeId matches
    // resumeId が一致するか検証
    if (entry.resumeId !== resumeId) {
      return null;
    }

    // Validate results array exists
    // results 配列が存在するか検証
    if (!Array.isArray(entry.results) || entry.results.length === 0) {
      return null;
    }

    return entry.results;
  } catch (error) {
    console.warn("Failed to load batch match cache:", error);
    return null;
  }
}

/**
 * @description Save batch match results to sessionStorage.
 * @description sessionStorage にバッチマッチング結果を保存。
 * @param resumeId Resume ID associated with the results.
 * @param resumeId 結果に関連付けられたレジュメID。
 * @param results Match results array to cache.
 * @param results キャッシュするマッチング結果配列。
 */
export function saveBatchMatchCache(
  resumeId: string,
  results: MatchResultItem[]
): void {
  if (!isBrowser() || !resumeId) {
    return;
  }

  try {
    const entry: BatchMatchCacheEntry = {
      resumeId,
      results,
      timestamp: Date.now(),
    };

    sessionStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch (error) {
    console.warn("Failed to save batch match cache:", error);
  }
}

/**
 * @description Clear batch match cache from sessionStorage.
 * @description sessionStorage からバッチマッチングキャッシュをクリア。
 */
export function clearBatchMatchCache(): void {
  if (!isBrowser()) {
    return;
  }

  try {
    sessionStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.warn("Failed to clear batch match cache:", error);
  }
}

