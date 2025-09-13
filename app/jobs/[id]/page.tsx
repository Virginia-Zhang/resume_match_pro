/**
 * @file page.tsx
 * @description Job detail page with strict flow guard. Data hydrates from sessionStorage (JobDetailV2) on client.
 * @description フローガード付きの求人詳細。データはクライアントで sessionStorage(JobDetailV2) からハイドレート。
 */

import React from "react";
import { redirect } from "next/navigation";
import ClientDetailView from "./client-detail-view";

// Data fetching functions moved to client-side charts component
// データ取得関数はクライアントサイドのチャートコンポーネントに移動

/**
 * Server component for job detail page with strict flow guard
 * 厳格なフローガード付きの求人詳細ページのサーバーコンポーネント
 */
export default async function JobDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ resumeId?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const jobId = resolvedParams.id;
  const resumeId = resolvedSearchParams?.resumeId;

  // Strict flow guard: must have resumeId from upload flow
  // 厳格なフローガード：アップロードフローから resumeId が必要
  if (!resumeId) {
    redirect("/upload");
  }

  return <ClientDetailView jobId={jobId} resumeId={resumeId} />;
}
