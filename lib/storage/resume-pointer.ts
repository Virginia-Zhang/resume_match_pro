/**
 * @file resume-pointer.ts
 * @description Client localStorage helper for persisting resume pointer (resumeId only, not resume content).
 * @description レジュメポインタ（レジュメ内容ではなくresumeIdのみ）を永続化するクライアント localStorage ヘルパー。
 * @author Virginia Zhang
 * @remarks Browser-only. Stores only the resumeId reference, never the actual resume text or secrets.
 * @remarks ブラウザ専用。実際のレジュメテキストや機密情報ではなく、resumeId参照のみを保存。
 */

import { STORAGE_RESUME_POINTER_KEY } from "@/app/constants/constants";

/**
 * @description Resume pointer data structure stored in localStorage.
 * @description localStorage に保存されるレジュメポインタのデータ構造。
 */
interface ResumePointerData {
  resumeId: string;
  savedAt: string;
}

/**
 * @description Helper object to persist and retrieve current resume pointer from localStorage.
 * @description localStorage から現在のレジュメポインタを保存・取得するヘルパーオブジェクト。
 */
export const resumePointer = {
  key: STORAGE_RESUME_POINTER_KEY,

  /**
   * @description Save pointer to localStorage as JSON { resumeId, savedAt }.
   * @description ポインタを { resumeId, savedAt } のJSONとして localStorage に保存。
   * @param resumeId Resume identifier to persist.
   * @param resumeId 保存するレジュメID。
   */
  save(resumeId: string): void {
    if (globalThis.window === undefined) return;
    try {
      const payload: ResumePointerData = {
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
      globalThis.window.localStorage.setItem(this.key, JSON.stringify(payload));
    } catch {
      // Silently ignore storage errors (e.g., quota exceeded, private browsing)
      // ストレージエラーを静かに無視（例：容量超過、プライベートブラウジング）
    }
  },

  /**
   * @description Load pointer from localStorage.
   * @description localStorage からポインタを読み込み。
   * @returns Parsed pointer object or null if not found/invalid.
   * @returns パース済みポインタオブジェクト、見つからない/無効な場合は null。
   */
  load(): ResumePointerData | null {
    if (globalThis.window === undefined) return null;
    try {
      const raw = globalThis.window.localStorage.getItem(this.key);
      if (!raw) return null;

      const parsed = JSON.parse(raw) as {
        resumeId?: unknown;
        savedAt?: unknown;
      };

      const resumeId =
        typeof parsed.resumeId === "string" ? parsed.resumeId : "";
      const savedAt =
        typeof parsed.savedAt === "string" ? parsed.savedAt : "";

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
    if (globalThis.window === undefined) return;
    try {
      globalThis.window.localStorage.removeItem(this.key);
    } catch {
      // Silently ignore storage errors
      // ストレージエラーを静かに無視
    }
  },
};

