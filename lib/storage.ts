/**
 * @file storage.ts
 * @description Client storage helpers for non-sensitive pointers (resumeId only).
 * @description 機微情報ではないポインタ（resumeId のみ）を扱うクライアントストレージヘルパー。
 * @author Virginia Zhang
 * @remarks Browser-only. Never store resume_text or secrets.
 * @remarks ブラウザ専用。resume_text や機密情報は保存しない。
 */

/**
 * Helper to persist and retrieve current resume pointer.
 * 現在の履歴書ポインタを保存・取得するヘルパー。
 */
export const resumePointer = {
  key: "resume:current",
  /**
   * @description Save pointer to localStorage as JSON { resumeId, savedAt }.
   * @description ポインタを { resumeId, savedAt } のJSONとして localStorage に保存。
   * @param resumeId Resume identifier to persist / 保存する履歴書ID
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
