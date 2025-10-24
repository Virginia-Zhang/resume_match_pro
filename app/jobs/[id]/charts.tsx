/**
 * @file charts.tsx
 * @description Client-only chart placeholders using Recharts: Donut for overall, Radar for 5-dim scores.
 * @description クライアント専用のRechartsプレースホルダー：総合スコアはドーナツ、5次元はレーダー。
 * @author Virginia Zhang
 * @remarks Client component; receives API envelopes and renders.
 * @remarks クライアントコンポーネント。APIエンベロープを受け取り描画。
 */
"use client";

import { fetchJson } from "@/lib/fetcher";
import { getFriendlyErrorMessage } from "@/lib/errorHandling";
import ErrorDisplay from "@/components/common/ErrorDisplay";
import React from "react";
import ChartsSummarySkeleton from "@/components/skeleton/ChartsSummarySkeleton";
import ChartsDetailsSkeleton from "@/components/skeleton/ChartsDetailsSkeleton";
import {
  API_MATCH_SUMMARY,
  API_MATCH_DETAILS,
  ROUTE_UPLOAD,
} from "@/app/constants/constants";
import { getApiBase } from "@/lib/runtime-config";
import {
  Cell,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

interface SummaryEnvelope {
  meta: { resumeHash: string };
  data: {
    overall: number;
    scores: Record<string, number>;
  };
}

interface DetailsEnvelope {
  meta: { resumeHash: string };
  data: {
    advantages: string[];
    disadvantages: string[];
    advice: Array<{
      title: string;
      detail: string;
    }>;
    overview: string;
  };
}

/**
 * @description Normalize scores data for radar chart display
 * @description レーダーチャート表示用のスコアデータを正規化
 * @param scores Raw scores object
 * @param scores 生のスコアオブジェクト
 * @returns Normalized scores array for radar chart
 * @returns レーダーチャート用の正規化されたスコア配列
 */
function normalizeScores(scores: Record<string, number> | undefined) {
  // Map English keys to Japanese labels for display
  const labelMap: Record<string, string> = {
    skills: "技術スキル",
    experience: "経験",
    projects: "プロジェクト",
    education: "学歴",
    soft: "ソフトスキル",
  };

  const fallback = Object.values(labelMap).map(name => ({ name, value: 0 }));
  if (!scores) return fallback;

  // Object: map each key to JP label if available
  const items = Object.entries(scores).map(([rawName, value]) => {
    const name = labelMap[rawName] || rawName;
    return { name, value: Number(value) };
  });
  return items;
}

interface ChartsProps {
  resumeId: string;
  jobId: string;
  jobDescription: string;
  overallScore?: number;
  scores?: {
    skills: number;
    experience: number;
    projects: number;
    education: number;
    soft: number;
  };
}

export default function Charts({
  resumeId,
  jobId,
  jobDescription,
  overallScore,
  scores,
}: ChartsProps): React.JSX.Element {
  const [summary, setSummary] = React.useState<SummaryEnvelope | null>(null);
  const [details, setDetails] = React.useState<DetailsEnvelope | null>(null);
  const [summaryLoading, setSummaryLoading] = React.useState(true);
  const [detailsLoading, setDetailsLoading] = React.useState(true);
  const [summaryError, setSummaryError] = React.useState<string | null>(null);
  const [detailsError, setDetailsError] = React.useState<string | null>(null);
  const [hover, setHover] = React.useState<{
    name: string;
    value: number;
  } | null>(null);

  // Fetch summary data independently
  // サマリーデータを独立して取得
  React.useEffect(() => {
    async function fetchSummary() {
      try {
        setSummaryLoading(true);
        setSummaryError(null);

        // Use provided overallScore and scores if available
        // 提供された overallScore と scores が利用可能な場合はそれを使用
        if (overallScore !== undefined && scores) {
          setSummary({
            meta: { resumeHash: "" },
            data: {
              overall: overallScore,
              scores: {
                skills: scores.skills,
                experience: scores.experience,
                projects: scores.projects,
                education: scores.education,
                soft: scores.soft,
              },
            },
          });
          setSummaryLoading(false);
          return;
        }

        const summaryUrl = `${getApiBase()}${API_MATCH_SUMMARY}`;
        const difyUser = process.env.DIFY_USER || "ResumeMatch Pro User";
        const summaryData = await fetchJson<SummaryEnvelope>(summaryUrl, {
          method: "POST",
          body: JSON.stringify({
            inputs: {
              job_description: jobDescription,
            },
            response_mode: "blocking",
            user: difyUser,
            jobId,
            resumeId,
          }),
          timeoutMs: 90000, // 90 seconds for Dify API processing
        });
        setSummary(summaryData);
      } catch (err) {
        setSummaryError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setSummaryLoading(false);
      }
    }

    fetchSummary();
  }, [resumeId, jobId, jobDescription]);

  // Fetch details data only after summary is completed
  // サマリー完了後にのみ詳細データを取得
  React.useEffect(() => {
    async function fetchDetails() {
      // Only proceed if summary is completed
      if (!summary) return;

      try {
        setDetailsLoading(true);
        setDetailsError(null);

        // Get overall score from current summary state
        if (!summary) {
          setDetailsError("Summary data not available for details analysis");
          setDetailsLoading(false);
          return;
        }
        const overallFromSummary = summary.data.overall;

        const detailsUrl = `${getApiBase()}${API_MATCH_DETAILS}`;
        const difyUser = process.env.DIFY_USER || "ResumeMatch Pro User";

        const detailsData = await fetchJson<DetailsEnvelope>(detailsUrl, {
          method: "POST",
          body: JSON.stringify({
            inputs: {
              job_description: jobDescription,
              overall_from_summary: overallFromSummary,
            },
            response_mode: "blocking",
            user: difyUser,
            jobId,
            resumeId,
          }),
          timeoutMs: 90000, // 90 seconds for Dify API processing
        });
        setDetails(detailsData);
      } catch (err) {
        setDetailsError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setDetailsLoading(false);
      }
    }

    fetchDetails();
  }, [resumeId, jobId, jobDescription, summary]);

  // Render summary section independently
  // サマリーセクションを独立してレンダリング
  const renderSummarySection = () => {
    if (summaryLoading) {
      return <ChartsSummarySkeleton />;
    }

    if (summaryError) {
      return (
        <ErrorDisplay
          title="サマリー分析エラー"
          errorInfo={getFriendlyErrorMessage(summaryError)}
          uploadRoute={ROUTE_UPLOAD}
        />
      );
    }

    if (!summary) return null;

    const overall = Math.max(
      0,
      Math.min(100, Number(summary?.data?.overall ?? 0))
    );
    const scores = normalizeScores(
      summary?.data?.scores as Record<string, number> | undefined
    );

    return (
      <div>
        <h3 className="text-lg font-semibold mb-4 text-center">マッチ度</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border rounded-md">
            <h4 className="font-medium mb-3">全体スコア</h4>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  innerRadius={60}
                  outerRadius={100}
                  data={[
                    { name: "score", value: overall },
                    { name: "rest", value: 100 - overall },
                  ]}
                >
                  <Cell fill="#22c55e" />
                  <Cell fill="#e5e7eb" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <p className="text-center text-2xl font-semibold">{overall}</p>
            <div className="mt-3 p-3 rounded-md border bg-white/40 dark:bg-slate-900/30">
              <div className="text-sm text-muted-foreground text-center">
                満点は100点です
              </div>
            </div>
          </div>

          <div className="p-4 border rounded-md">
            <h4 className="font-medium mb-3">5次元スコア</h4>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart
                data={scores}
                onMouseLeave={() => setHover(null)}
                onMouseMove={state => {
                  const payload = (
                    state as unknown as {
                      isTooltipActive?: boolean;
                      activePayload?: Array<{
                        payload?: { name?: string; value?: number };
                      }>;
                    }
                  )?.activePayload;
                  const p = payload && payload[0] && payload[0].payload;
                  const name = (p?.name as string) || "";
                  const value = Number(p?.value);
                  if (!name || Number.isNaN(value)) {
                    if (hover !== null) setHover(null);
                    return;
                  }
                  setHover(prev =>
                    prev && prev.name === name && prev.value === value
                      ? prev
                      : { name, value }
                  );
                }}
              >
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <Radar
                  dataKey="value"
                  stroke="#0ea5e9"
                  fill="#0ea5e9"
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
            <div className="mt-1 p-3 rounded-md border bg-white/40 dark:bg-slate-900/30">
              {hover ? (
                <div>
                  <div className="text-base font-medium">{hover.name}</div>
                  <div className="mt-1 text-2xl font-semibold">
                    {hover.value}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  ヒント：頂点にホバー/タップしてください
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    );
  };

  // Render details section independently
  // 詳細セクションを独立してレンダリング
  const renderDetailsSection = () => {
    if (detailsLoading) {
      return <ChartsDetailsSkeleton />;
    }

    if (detailsError) {
      return (
        <ErrorDisplay
          title="詳細分析エラー"
          errorInfo={getFriendlyErrorMessage(detailsError)}
          uploadRoute={ROUTE_UPLOAD}
        />
      );
    }

    if (!details) return null;

    return (
      <div>
        {/* Overview text section */}
        {/* 概要テキストセクション */}
        {details.data.overview && (
          <div className="my-6 p-4 border rounded-md bg-gray-50 dark:bg-gray-900/50">
            <h4 className="font-medium mb-3">分析概要</h4>
            <div className="text-sm text-muted-foreground">
              {details.data.overview
                .split(/[。！？]/)
                .filter(sentence => sentence.trim())
                .map((sentence, index) => (
                  <div key={index} className="mb-2">
                    {sentence.trim()}
                    {sentence.trim() &&
                      !sentence.endsWith("。") &&
                      !sentence.endsWith("！") &&
                      !sentence.endsWith("？") &&
                      "。"}
                  </div>
                ))}
            </div>
          </div>
        )}
        {/* Advice section */}
        {/* 面接アドバイスセクション */}
        <h3 className="text-lg font-semibold mb-4 text-center">
          面接アドバイス
        </h3>
        <div className="p-4 border rounded-md">
          <div className="space-y-6 text-sm">
            <section>
              <h4 className="font-medium mb-3">強み</h4>
              <ul className="list-disc pl-5 space-y-1">
                {details.data.advantages?.map((x, i) => (
                  <li key={`adv-${i}`}>{x}</li>
                ))}
              </ul>
            </section>
            <section>
              <h4 className="font-medium mb-3">弱み</h4>
              <ul className="list-disc pl-5 space-y-1">
                {details.data.disadvantages?.map((x, i) => (
                  <li key={`dis-${i}`}>{x}</li>
                ))}
              </ul>
            </section>
            <section>
              <h4 className="font-medium mb-3">面接対策</h4>
              <ul className="list-disc pl-5 space-y-2">
                {details.data.advice?.map((item, i) => (
                  <li key={`adv-${i}`}>
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">
                      {item.detail}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderSummarySection()}
      {renderDetailsSection()}
    </div>
  );
}