/**
 * @file resume.ts
 * @description Zustand store for managing resume state (client-side global state).
 * @description レジュメ状態を管理するZustandストア（クライアントサイドのグローバル状態）。
 * @author Virginia Zhang
 * @remarks Uses persist middleware for automatic localStorage persistence.
 * @remarks 自動的なlocalStorage永続化のためにpersistミドルウェアを使用。
 */

import { STORAGE_RESUME_POINTER_KEY } from "@/app/constants/constants";
import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * @description Resume state interface.
 * @description レジュメ状態のインターフェース。
 */
interface ResumeState {
  /**
   * @description Resume storage key (resumeId) for S3 lookup.
   * @description S3検索用のレジュメストレージキー（resumeId）。
   */
  resumeStorageKey: string | null;

  /**
   * @description Timestamp when resume was uploaded (ISO string).
   * @description レジュメがアップロードされたタイムスタンプ（ISO文字列）。
   */
  resumeUploadedAt: string | null;
}

/**
 * @description Actions for resume state management.
 * @description レジュメ状態管理のアクション。
 */
interface ResumeActions {
  /**
   * @description Set resume information.
   * @description レジュメ情報を設定します。
   * @param storageKey Resume storage key (resumeId) / レジュメストレージキー（resumeId）
   */
  setResume: (storageKey: string) => void;

  /**
   * @description Clear all resume information.
   * @description すべてのレジュメ情報をクリアします。
   */
  clearResume: () => void;

  /**
   * @description Check if resume exists.
   * @description レジュメが存在するか確認します。
   * @returns true if resume exists, false otherwise / レジュメが存在する場合はtrue、それ以外はfalse
   */
  hasResume: () => boolean;
}

/**
 * @description Combined resume store type.
 * @description レジュメストアの結合型。
 */
type ResumeStore = ResumeState & ResumeActions;

/**
 * @description Initial state for resume store.
 * @description レジュメストアの初期状態。
 */
const initialState: ResumeState = {
  resumeStorageKey: null,
  resumeUploadedAt: null,
};

/**
 * @description Zustand store for resume state management with persistence.
 * @description 永続化機能付きのレジュメ状態管理用Zustandストア。
 * @remarks The store automatically persists to localStorage using the persist middleware.
 * @remarks ストアはpersistミドルウェアを使用して自動的にlocalStorageに永続化されます。
 */

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setResume: (storageKey: string) => {
        set({
          resumeStorageKey: storageKey,
          resumeUploadedAt: new Date().toISOString(),
        });
      },

      clearResume: () => {
        set(initialState);
      },

      hasResume: () => {
        const state = get();
        return Boolean(state.resumeStorageKey);
      },
    }),
    {
      name: STORAGE_RESUME_POINTER_KEY, // localStorage key / localStorageキー
      // Persist all state fields
      // すべての状態フィールドを永続化
      partialize: (state) => ({
        resumeStorageKey: state.resumeStorageKey,
        resumeUploadedAt: state.resumeUploadedAt,
      }),
      // Migration function to handle old data format
      // 古いデータ形式を処理するためのマイグレーション関数
      migrate: (persistedState: unknown) => {
        const state = persistedState as Record<string, unknown>;
        
        // Migrate from old format (resumeId, savedAt) to new format (resumeStorageKey, resumeUploadedAt)
        // 古い形式（resumeId, savedAt）から新しい形式（resumeStorageKey, resumeUploadedAt）へ移行
        if (state && typeof state === "object") {
          const migratedState: ResumeState = {
            resumeStorageKey: null,
            resumeUploadedAt: null,
          };
          
          // Handle old field names
          // 古いフィールド名を処理
          if ("resumeId" in state && typeof state.resumeId === "string") {
            migratedState.resumeStorageKey = state.resumeId;
          } else if ("resumeStorageKey" in state) {
            migratedState.resumeStorageKey = state.resumeStorageKey as string | null;
          }
          
          if ("savedAt" in state && typeof state.savedAt === "string") {
            // Convert savedAt format "2025/12/02 18:02:10" to ISO string
            // savedAt形式 "2025/12/02 18:02:10" をISO文字列に変換
            try {
              const date = new Date(state.savedAt);
              migratedState.resumeUploadedAt = date.toISOString();
            } catch {
              migratedState.resumeUploadedAt = null;
            }
          } else if ("resumeUploadedAt" in state) {
            migratedState.resumeUploadedAt = state.resumeUploadedAt as string | null;
          }
          
          return migratedState;
        }
        
        return initialState;
      },
      version: 1, // Set version to enable migration
    }
  )
);

