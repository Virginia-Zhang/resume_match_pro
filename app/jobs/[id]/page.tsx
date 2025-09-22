/**
 * @file page.tsx
 * @description Job detail page with strict flow guard. Data hydrates from sessionStorage (JobDetailV2) on client.
 * @description フローガード付きの求人詳細。データはクライアントで sessionStorage(JobDetailV2) からハイドレート。
 */

import React from "react";
// redirect not used after guard refactor
// リファクタ後 redirect は未使用
// import { redirect } from "next/navigation";
// import Skeleton from "@/components/ui/skeleton";
// import { resumePointer } from "@/lib/storage";
import ClientDetailView from "./client-detail-view";
import ResumeGate from "@/components/guards/ResumeGate";

// Data fetching functions moved to client-side charts component
// データ取得関数はクライアントサイドのチャートコンポーネントに移動

/**
 * Server component for job detail page with strict flow guard
 * 厳格なフローガード付きの求人詳細ページのサーバーコンポーネント
 */
/**
 * Job detail server component wrapped by ResumeGuard.
 * ResumeGuard でラップされた求人詳細サーバーコンポーネント。
 * @param {object} params - Route params
 * @param {Promise<{ id: string }>} params.params - dynamic segment
 * @returns {Promise<React.JSX.Element>} JSX element
 */
export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.JSX.Element> {
  const resolvedParams = await params;
  const jobId = resolvedParams.id;

  // Keep detail view as-is; charts fetch uses `resumeId` from searchParams previously.
  // Here we simply allow navigation when gate passes (i.e., resume:current exists).
  // The child component already receives resumeId from server props earlier; if needed,
  // we can extend to read from localStorage, but current flow relies on APIs using resumeId passed along.

  return (
    <ResumeGate variant="detail" injectResumeId>
      <ClientDetailView jobId={jobId} resumeId={""} />
    </ResumeGate>
  );
}
