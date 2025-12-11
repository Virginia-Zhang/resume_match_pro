/**
 * @file ids.ts
 * @description Server-side ID management for request tracking and anonymous user identification.
 * @description リクエストトラッキングと匿名ユーザー識別用のサーバーサイド ID 管理。
 * @author Virginia Zhang
 * @remarks Provides request ID generation and anonymous ID extraction from headers.
 * @remarks リクエスト ID の生成とヘッダーからの匿名 ID 抽出を提供します。
 */

import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";

/**
 * @description Generate a unique request ID using UUID v4
 * @description UUID v4 を使用して一意のリクエスト ID を生成
 * @returns A new UUID v4 string
 * @returns 新しい UUID v4 文字列
 */
export function generateRequestId(): string {
  return randomUUID();
}

/**
 * @description Extract anonymous user ID from request headers
 * @description リクエストヘッダーから匿名ユーザー ID を抽出
 * @param request Next.js request object
 * @param request Next.js リクエストオブジェクト
 * @returns Anonymous ID from header, or undefined if not present
 * @returns ヘッダーからの匿名 ID、存在しない場合は undefined
 */
export function getAnonymousId(request: NextRequest): string | undefined {
  const anonymousId = request.headers.get("x-anonymous-id");
  return anonymousId || undefined;
}

/**
 * @description Extract or generate request ID from headers or generate new
 * @description ヘッダーからリクエスト ID を抽出するか、新しいものを生成
 * @param request Next.js request object
 * @param request Next.js リクエストオブジェクト
 * @returns Request ID (existing from header or newly generated)
 * @returns リクエスト ID（ヘッダーからの既存または新規生成）
 */
export function getOrGenerateRequestId(request: NextRequest): string {
  const existingId = request.headers.get("x-request-id");
  if (existingId) {
    return existingId;
  }
  return generateRequestId();
}


