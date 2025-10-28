/**
 * @file page.tsx
 * @description Jobs list page with AI matching functionality
 * @description AI マッチング機能付きの求人一覧ページ
 * @author Virginia Zhang
 * @remarks Server component that fetches jobs and passes to client component for AI matching
 * @remarks 求人を取得してクライアントコンポーネントに渡し、AI マッチングを実行するサーバーコンポーネント
 */

import React from "react";
import { fetchJobs, toListItem } from "@/lib/jobs";
import ResumeGate from "@/components/guards/ResumeGate";
import JobsListClient from "./JobsListClient";

/**
 * Jobs listing server component with AI matching integration
 * AI マッチング統合付きの求人一覧サーバーコンポーネント
 *
 * @returns {Promise<React.JSX.Element>} Jobs list markup with AI matching
 * @returns AI マッチング付きの求人一覧マークアップ
 */
export default async function JobsPage(): Promise<React.JSX.Element> {
  // Fetch jobs data on server
  // サーバーで求人データを取得
  const jobDetails = await fetchJobs();
  const jobs = jobDetails.map(toListItem);

  return (
    // Use ResumeGate to block requests when resume is not present
    // レジュメがない場合はリクエストをブロック
    // The actual value of resumeId is injected by ResumeGate into the child component
    // 実際の resumeId は ResumeGate によって子コンポーネントに注入されます
    <ResumeGate>
      <JobsListClient initialJobs={jobs} />
    </ResumeGate>
  );
}
