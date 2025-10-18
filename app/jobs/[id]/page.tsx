/**
 * @file page.tsx
 * @description Job detail page with strict flow guard. Data hydrates from sessionStorage (JobDetailV2) on client.
 * @description フローガード付きの求人詳細。データはクライアントで sessionStorage(JobDetailV2) からハイドレート。
 */

import React from "react";
import JobDetailClient from "./JobDetailClient";
import ResumeGate from "@/components/guards/ResumeGate";

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
    // Use ResumeGate to block requests when resume is not present
    // レジュメがない場合はリクエストをブロック
    // The actual value of resumeId is injected by ResumeGate into the child component
    // 実際の resumeId は ResumeGate によって子コンポーネントに注入されます
    <ResumeGate>
      <JobDetailClient jobId={jobId} />
    </ResumeGate>
  );
}
