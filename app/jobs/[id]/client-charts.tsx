/**
 * @file client-charts.tsx
 * @description Client-side wrapper for charts component with dynamic import
 * @description チャートコンポーネントのクライアントサイドラッパー（動的インポート付き）
 * @author Virginia Zhang
 * @remarks Client component to handle dynamic import with ssr: false
 * @remarks クライアントコンポーネント。ssr: false で動的インポートを処理
 */

"use client";

import dynamic from "next/dynamic";
import React from "react";

const ClientCharts = dynamic(() => import("./charts"), { ssr: false });

/**
 * Props interface for ClientChartsWrapper component
 * ClientChartsWrapperコンポーネントのプロパティインターフェース
 */
interface ClientChartsWrapperProps {
  resumeId: string;
  resumeHash: string;
  jobId: string;
  jobDescription: string;
}

/**
 * Client-side wrapper for charts component
 * チャートコンポーネントのクライアントサイドラッパー
 *
 * @param props - Component props / コンポーネントのプロパティ
 * @param props.resumeId - Resume ID for API calls / API呼び出し用の履歴書ID
 * @param props.resumeHash - Resume hash for caching / キャッシュ用の履歴書ハッシュ
 * @param props.jobId - Job ID for API calls / API呼び出し用の求人ID
 * @param props.jobDescription - Job description for AI analysis / AI分析用の求人説明
 * @returns JSX element / JSX要素
 */
export default function ClientChartsWrapper({
  resumeId,
  resumeHash,
  jobId,
  jobDescription,
}: ClientChartsWrapperProps): React.JSX.Element {
  return (
    <ClientCharts
      resumeId={resumeId}
      resumeHash={resumeHash}
      jobId={jobId}
      jobDescription={jobDescription}
    />
  );
}
