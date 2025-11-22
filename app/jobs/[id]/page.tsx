/**
 * @file page.tsx
 * @description Job detail page with strict flow guard. Data hydrates from sessionStorage (JobDetailV2) on client.
 * @description フローガード付きの求人詳細。データはクライアントで sessionStorage(JobDetailV2) からハイドレート。
 */

import ResumeGate from "@/components/guards/ResumeGate";
import React from "react";
import JobDetailClient from "./JobDetailClient";

/**
 * Job detail server component wrapped by ResumeGuard.
 * ResumeGuard でラップされた求人詳細サーバーコンポーネント。
 * @param {object} params - Route params
 * @param {Promise<{ id: string }>} params.params - dynamic segment
 * @returns {Promise<React.JSX.Element>} JSX element
 */
type JobDetailPageProps = Readonly<{
  params: Promise<{ id: string }>;
}>;

export default async function JobDetailPage({
  params,
}: JobDetailPageProps): Promise<React.JSX.Element> {
  const resolvedParams = await params;
  const jobId = resolvedParams.id;


  return (
    // Use ResumeGate to block requests when resume is not present
    // レジュメがない場合はリクエストをブロック
    // The actual value of resumeId is injected by ResumeGate into the child component
    // 実際の resumeId は ResumeGate によって子コンポーネントに注入されます
    <ResumeGate>
      <JobDetailClient jobId={jobId} />
    </ResumeGate>
  );
}
