/**
 * @file client.ts
 * @description Supabase client for Client Components
 * @description クライアントコンポーネント用の Supabase クライアント
 * @author Virginia Zhang
 * @remarks Uses @supabase/ssr for Next.js client-side support
 * @remarks Next.js クライアントサイドサポートのために @supabase/ssr を使用
 */

import { createBrowserClient } from "@supabase/ssr";

/**
 * @description Create Supabase client for client-side usage
 * @description クライアントサイド使用用の Supabase クライアントを作成
 * @returns Supabase client instance
 * @returns Supabase クライアントインスタンス
 * @remarks Uses NEXT_PUBLIC_SUPABASE_ANON_KEY for RLS support
 * @remarks RLS サポートのために NEXT_PUBLIC_SUPABASE_ANON_KEY を使用
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}






