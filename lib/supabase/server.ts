/**
 * @file server.ts
 * @description Supabase client for Server Components and Route Handlers
 * @description サーバーコンポーネントとルートハンドラー用の Supabase クライアント
 * @author Virginia Zhang
 * @remarks Uses @supabase/ssr for Next.js server-side support
 * @remarks Next.js サーバーサイドサポートのために @supabase/ssr を使用
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * @description Create Supabase client for server-side usage
 * @description サーバーサイド使用用の Supabase クライアントを作成
 * @returns Supabase client instance
 * @returns Supabase クライアントインスタンス
 * @remarks Uses NEXT_PUBLIC_SUPABASE_ANON_KEY for RLS support
 * @remarks RLS サポートのために NEXT_PUBLIC_SUPABASE_ANON_KEY を使用
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Can be ignored when calling Server Component (if middleware is present)
            // Server Component 呼び出し時に無視可能（middleware がある場合）
          }
        },
      },
    }
  );
}






