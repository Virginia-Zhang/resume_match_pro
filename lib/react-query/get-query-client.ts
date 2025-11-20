/**
 * @file get-query-client.ts
 * @description QueryClient factory for Next.js App Router with SSR support.
 * @description Next.js App Router用のSSR対応QueryClientファクトリー。
 * @author Virginia Zhang
 * @remarks Creates a new QueryClient for each server request, reuses single client in browser.
 * @remarks サーバーリクエストごとに新しいQueryClientを作成し、ブラウザでは単一のクライアントを再利用。
 */

import { isServer, QueryClient } from "@tanstack/react-query";

/**
 * @description Creates a new QueryClient with default options for SSR.
 * @description SSR用のデフォルトオプションで新しいQueryClientを作成。
 * @returns Configured QueryClient instance
 * @returns 設定されたQueryClientインスタンス
 */
function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        // SSRでは、クライアントで即座に再取得を避けるために、デフォルトのstaleTimeを0より大きく設定
        staleTime: 60 * 1000, // 1 minute / 1分
        gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime in v4) / 5分（v4ではcacheTime）
        retry: 1, // Retry once on failure / 失敗時に1回再試行
        refetchOnWindowFocus: false, // Next.js doesn't need this / Next.jsでは不要
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

/**
 * @description Gets a QueryClient instance, creating a new one for server requests
 * and reusing a single instance in the browser.
 * @description QueryClientインスタンスを取得。サーバーリクエストでは新規作成し、ブラウザでは単一インスタンスを再利用。
 * @returns QueryClient instance
 * @returns QueryClientインスタンス
 * @remarks This is important to prevent re-creating the client if React
 * suspends during initial render. This may not be needed if we have
 * a suspense boundary BELOW the creation of the query client.
 * @remarks Reactが初期レンダリング中にサスペンドした場合にクライアントを再作成しないようにするために重要。
 * @remarks QueryClientの作成の下にサスペンス境界がある場合は不要かもしれません。
 */
export function getQueryClient(): QueryClient {
  if (isServer) {
    // Server: always make a new query client
    // サーバー：常に新しいクエリクライアントを作成
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // ブラウザ：まだない場合のみ新しいクエリクライアントを作成
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient();
    }
    return browserQueryClient;
  }
}

