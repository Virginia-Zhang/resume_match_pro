/**
 * @file query-provider.tsx
 * @description TanStack Query provider component for Next.js App Router.
 * @description Next.js App Router用のTanStack Queryプロバイダーコンポーネント。
 * @author Virginia Zhang
 * @remarks Client component. Wraps the app with QueryClientProvider context.
 * @remarks クライアントコンポーネント。アプリをQueryClientProviderコンテキストでラップ。
 */

"use client";

import { getQueryClient } from "@/lib/react-query/get-query-client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

interface QueryProviderProps {
  children: React.ReactNode;
}

/**
 * @component QueryProvider
 * @description Provides TanStack Query context to the application.
 * @description アプリケーションにTanStack Queryコンテキストを提供。
 * @param props Component props
 * @param props コンポーネントのプロパティ
 * @param props.children Child components to wrap
 * @param props.children ラップする子コンポーネント
 * @returns QueryClientProvider wrapper with ReactQueryDevtools
 * @returns ReactQueryDevtools付きのQueryClientProviderラッパー
 * @remarks NOTE: Avoid useState when initializing the query client if you don't
 * have a suspense boundary between this and the code that may suspend because
 * React will throw away the client on the initial render if it suspends and
 * there is no boundary.
 * @remarks 注意：このコンポーネントとサスペンドする可能性のあるコードの間に
 * サスペンス境界がない場合、useStateでクエリクライアントを初期化しないでください。
 * サスペンドして境界がない場合、Reactは初期レンダリング時にクライアントを破棄します。
 */
export function QueryProvider({ children }: QueryProviderProps) {
  // Get QueryClient instance (creates new for server, reuses for browser)
  // QueryClientインスタンスを取得（サーバーでは新規作成、ブラウザでは再利用）
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* React Query DevTools - only shown in development */}
      {/* React Query DevTools - 開発環境でのみ表示 */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

