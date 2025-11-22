/**
 * @file page.tsx
 * @description Jobs list page with AI matching functionality
 * @description AI マッチング機能付きの求人一覧ページ
 * @author Virginia Zhang
 * @remarks Server component that fetches jobs and passes to client component for AI matching
 * @remarks 求人を取得してクライアントコンポーネントに渡し、AI マッチングを実行するサーバーコンポーネント
 */

import ResumeGate from "@/components/guards/ResumeGate";
import { fetchJobs } from "@/lib/api/jobs";
import { getQueryClient } from "@/lib/react-query/get-query-client";
import { queryKeys } from "@/lib/react-query/query-keys";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import React from "react";
import JobsListClient from "./JobsListClient";

/**
 * Jobs listing server component with AI matching integration
 * AI マッチング統合付きの求人一覧サーバーコンポーネント
 *
 * @returns {Promise<React.JSX.Element>} Jobs list markup with AI matching
 * @returns AI マッチング付きの求人一覧マークアップ
 */
export default async function JobsPage(): Promise<React.JSX.Element> {
  const queryClient = getQueryClient();

  // Prefetch job list on the server to hydrate client-side TanStack Query cache
  // クライアントの TanStack Query キャッシュをハイドレートするため、サーバーで求人一覧をプリフェッチ
  await queryClient.prefetchQuery({
    queryKey: queryKeys.jobs.list("all"),
    queryFn: () => fetchJobs(),
  });

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      {/* Use ResumeGate to block requests when resume is not present */}
      {/* レジュメがない場合はリクエストをブロック */}
      <ResumeGate>
        <JobsListClient />
      </ResumeGate>
    </HydrationBoundary>
  );
}
