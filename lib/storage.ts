/**
 * @file storage.ts
 * @description Client storage helpers for non-sensitive data (resumeId pointer and batch matching results).
 * @description 機微情報ではないデータ（レジュメIDポインタとバッチマッチング結果）を扱うクライアントストレージヘルパー。
 * @author Virginia Zhang
 * @remarks Browser-only. Never store resume_text or secrets.
 * @remarks ブラウザ専用。resume_text や機密情報は保存しない。
 */

/**
 * Helper to persist and retrieve current resume pointer and manage batch matching session data.
 * 現在のレジュメポインタを保存・取得し、バッチマッチングセッションデータを管理するヘルパー。
 */
import { STORAGE_RESUME_POINTER_KEY } from "@/app/constants/constants";

/**
 * @description Session storage keys for batch matching results
 * @description バッチマッチング結果用のセッションストレージキー
 */
const STORAGE_BATCH_RESULTS_KEY = 'batch-matching-results';
const STORAGE_BATCH_COMPLETE_KEY = 'batch-matching-complete';
const STORAGE_BATCH_PROCESSED_KEY = 'batch-matching-processed';
const STORAGE_BATCH_TOTAL_KEY = 'batch-matching-total';

export const resumePointer = {
  key: STORAGE_RESUME_POINTER_KEY,
  /**
   * @description Save pointer to localStorage as JSON { resumeId, savedAt }.
   * @description ポインタを { resumeId, savedAt } のJSONとして localStorage に保存。
   * @param resumeId Resume identifier to persist / 保存するレジュメID
   */
  save(resumeId: string): void {
    if (typeof window === "undefined") return;
    try {
      const payload = {
        resumeId,
        savedAt: new Date().toLocaleString("ja-JP", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }),
      };
      window.localStorage.setItem(this.key, JSON.stringify(payload));
    } catch {
      // ignore
    }
  },
  /**
   * @description Load pointer from localStorage.
   * @description localStorage からポインタを読み込み。
   * @returns { resumeId: string; savedAt: number } | null Parsed pointer or null / パース済みポインタ、なければ null
   * @returns { resumeId: string; savedAt: number } | null パース済みポインタ、なければ null
   */
  load(): { resumeId: string; savedAt: string } | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(this.key);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as {
        resumeId?: unknown;
        savedAt?: unknown;
      };
      const resumeId = String(parsed.resumeId || "");
      const savedAt = String(parsed.savedAt || "");
      if (!resumeId || !savedAt) return null;
      return { resumeId, savedAt };
    } catch {
      return null;
    }
  },
  /**
   * @description Clear stored pointer from localStorage.
   * @description 保存されたポインタを localStorage から削除。
   */
  clear(): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(this.key);
    } catch {
      // ignore
    }
  },
};

/**
 * @description Load all batch matching results from sessionStorage
 * @description セッションストレージからすべてのバッチマッチング結果を読み込み
 * @returns Object containing all batch matching data or null
 * @returns すべてのバッチマッチングデータを含むオブジェクト、なければ null
 */
export function loadBatchMatchingResults(): {
  results: unknown;
  isComplete: boolean;
  processedJobs: number;
  totalJobs: number;
} | null {
  if (typeof window === "undefined") return null;
  try {
    const savedResults = window.sessionStorage.getItem(STORAGE_BATCH_RESULTS_KEY);
    const isComplete = window.sessionStorage.getItem(STORAGE_BATCH_COMPLETE_KEY) === 'true';
    const savedProcessed = window.sessionStorage.getItem(STORAGE_BATCH_PROCESSED_KEY);
    const savedTotal = window.sessionStorage.getItem(STORAGE_BATCH_TOTAL_KEY);
    
    if (!savedResults) return null;
    
    return {
      results: JSON.parse(savedResults),
      isComplete,
      processedJobs: savedProcessed ? parseInt(savedProcessed, 10) : 0,
      totalJobs: savedTotal ? parseInt(savedTotal, 10) : 0,
    };
  } catch (error) {
    console.error('Failed to load batch matching results:', error);
    return null;
  }
}

/**
 * @description Save all batch matching results to sessionStorage
 * @description すべてのバッチマッチング結果をセッションストレージに保存
 * @param results - Match results array
 * @param results マッチ結果配列
 * @param isComplete - Whether matching is complete
 * @param isComplete マッチングが完了しているかどうか
 * @param processedJobs - Number of processed jobs
 * @param processedJobs 処理済みの求人数
 * @param totalJobs - Total number of jobs
 * @param totalJobs 求人の総数
 */
export function saveBatchMatchingResults(
  results: unknown,
  isComplete: boolean,
  processedJobs: number,
  totalJobs: number
): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_BATCH_RESULTS_KEY, JSON.stringify(results));
    window.sessionStorage.setItem(STORAGE_BATCH_COMPLETE_KEY, isComplete.toString());
    window.sessionStorage.setItem(STORAGE_BATCH_PROCESSED_KEY, processedJobs.toString());
    window.sessionStorage.setItem(STORAGE_BATCH_TOTAL_KEY, totalJobs.toString());
  } catch (error) {
    console.error('Failed to save batch matching results:', error);
  }
}

/**
 * @description Clear all batch matching results from sessionStorage
 * @description セッションストレージからすべてのバッチマッチング結果をクリア
 * @remarks Called when uploading a new resume to ensure fresh matching results
 * @remarks 新しいレジュメをアップロードする際に呼び出し、新しいマッチング結果を保証
 */
export function clearBatchMatchingResults(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(STORAGE_BATCH_RESULTS_KEY);
    window.sessionStorage.removeItem(STORAGE_BATCH_COMPLETE_KEY);
    window.sessionStorage.removeItem(STORAGE_BATCH_PROCESSED_KEY);
    window.sessionStorage.removeItem(STORAGE_BATCH_TOTAL_KEY);
  } catch (error) {
    console.warn('Failed to clear sessionStorage:', error);
  }
}
