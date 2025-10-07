/**
 * @file runtime-config.ts
 * @description Resolve API base URL consistently across server/client.
 * @description サーバー/クライアントで一貫した API ベースURL解決。
 */

const DEV_DEFAULT_BASE = "http://127.0.0.1:3000";

/**
 * @description Get API base URL. On client returns empty string (same-origin). On server uses env or dev default.
 * @description クライアントでは空文字（同一オリジン）、サーバーでは環境変数か開発用デフォルトを返す。
 */
export function getApiBase(override?: string): string {
  if (override) return override;
  if (typeof window !== "undefined") return ""; // client: same-origin
  const envBase =
    process.env.NEXT_PUBLIC_API_BASE || process.env.API_BASE || "";
  return envBase || DEV_DEFAULT_BASE;
}
