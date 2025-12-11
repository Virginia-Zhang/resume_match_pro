/**
 * @file ids.ts
 * @description Client-side anonymous user ID management using localStorage.
 * @description localStorage を使用したクライアントサイドの匿名ユーザー ID 管理。
 * @author Virginia Zhang
 * @remarks Generates and persists anonymous user ID for tracking across sessions.
 * @remarks セッション全体でトラッキング用の匿名ユーザー ID を生成および永続化します。
 */

"use client";

import { ANALYTICS_ANONYMOUS_ID_KEY } from "@/app/constants/constants";

/**
 * @description Get or create anonymous user ID
 * @description 匿名ユーザー ID を取得または作成
 * @returns Anonymous user ID (UUID format)
 * @returns 匿名ユーザー ID (UUID形式)
 */
export function getOrCreateAnonymousId(): string {
  // Check if we're in browser environment
  // ブラウザ環境にいるかチェック
  if (globalThis.window === undefined) {
    // Generate a temporary ID if not in browser
    // ブラウザにいない場合は一時 ID を生成
    return generateUUID();
  }

  try {
    // Try to get existing ID from localStorage
    // localStorage から既存の ID を取得
    const existingId = globalThis.localStorage?.getItem(
      ANALYTICS_ANONYMOUS_ID_KEY
    );

    if (existingId) {
      return existingId;
    }

    // Generate new ID if not exists
    // 存在しない場合は新しい ID を生成
    const newId = generateUUID();

    // Store in localStorage
    // localStorage に保存
    globalThis.localStorage?.setItem(ANALYTICS_ANONYMOUS_ID_KEY, newId);

    return newId;
  } catch (error) {
    // Fall back to generating temporary ID if localStorage is not available
    // localStorage が利用できない場合は一時 ID の生成にフォールバック
    if (error instanceof Error) {
      console.warn("[Analytics] Failed to access localStorage:", error.message);
    }
    return generateUUID();
  }
}

/**
 * @description Generate a UUID v4 string
 * @description UUID v4 文字列を生成
 * @returns UUID v4 string
 * @returns UUID v4 文字列
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}

/**
 * @description Clear the stored anonymous user ID
 * @description 保存された匿名ユーザー ID をクリア
 */
export function clearAnonymousId(): void {
  if (globalThis.window !== undefined) {
    try {
      globalThis.localStorage?.removeItem(ANALYTICS_ANONYMOUS_ID_KEY);
    } catch (error) {
      if (error instanceof Error) {
        console.warn("[Analytics] Failed to clear localStorage:", error.message);
      }
    }
  }
}

