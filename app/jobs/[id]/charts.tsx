/**
 * @file charts.tsx
 * @description Client-only chart placeholders using Recharts: Donut for overall, Radar for 5-dim scores.
 * @description クライアント専用のRechartsプレースホルダー：総合スコアはドーナツ、5次元はレーダー。
 * @author Virginia Zhang
 * @remarks Client component; receives API envelopes and renders.
 * @remarks クライアントコンポーネント。APIエンベロープを受け取り描画。
 */
"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";

interface SummaryEnvelope {
  meta: { resumeHash: string };
  data: {
    overall: number;
    scores: number[] | Record<string, number>;
    overview: string;
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
  };
}

export default function ClientCharts({
  resumeId,
  resumeHash,
  jobId,
  jobDescription,
}: {
  resumeId: string;
  resumeHash: string;
  jobId: string;
  jobDescription: string;
}): React.JSX.Element {
  const [summary, setSummary] = React.useState<SummaryEnvelope | null>(null);
  const [details, setDetails] = React.useState<DetailsEnvelope | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const hasFetchedRef = React.useRef(false);

  React.useEffect(() => {
    // Prevent duplicate requests in React Strict Mode using useRef
    // useRefを使用してReact Strict Modeでの重複リクエストを防止
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch summary
        const summaryUrl = `${window.location.origin}/api/match/summary`;
        const summaryRes = await fetch(summaryUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jobId,
            job_description: jobDescription,
            resumeId,
            resumeHash,
            phase: "summary",
          }),
        });
        if (!summaryRes.ok) {
          const errorText = await summaryRes.text();
          throw new Error(
            `Summary fetch failed: ${summaryRes.status} ${errorText}`
          );
        }
        const summaryData = await summaryRes.json();
        setSummary(summaryData);

        // Fetch details
        const detailsUrl = `${window.location.origin}/api/match/details`;
        const detailsRes = await fetch(detailsUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jobId,
            job_description: jobDescription,
            resumeId,
            resumeHash,
            phase: "details",
          }),
        });
        if (!detailsRes.ok) {
          const errorText = await detailsRes.text();
          throw new Error(
            `Details fetch failed: ${detailsRes.status} ${errorText}`
          );
        }
        const detailsData = await detailsRes.json();
        setDetails(detailsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [resumeId, resumeHash, jobId, jobDescription]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 border rounded-md">
          <h3 className="text-lg font-medium mb-4">総合マッチスコア</h3>
          <div className="h-64 flex items-center justify-center">
            <div className="text-muted-foreground">読み込み中...</div>
          </div>
        </div>
        <div className="p-4 border rounded-md">
          <h3 className="text-lg font-medium mb-4">詳細分析</h3>
          <div className="h-64 flex items-center justify-center">
            <div className="text-muted-foreground">読み込み中...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border rounded-md bg-red-50 dark:bg-red-900/20">
        <h3 className="text-lg font-medium mb-2 text-red-600">エラー</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!summary || !details) {
    return (
      <div className="p-4 border rounded-md">
        <p className="text-muted-foreground">データがありません</p>
      </div>
    );
  }

  const overall = Math.max(
    0,
    Math.min(100, Number(summary?.data?.overall ?? 0))
  );
  const scores = normalizeScores(summary?.data?.scores);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="p-4 border rounded-md">
        <h3 className="font-medium mb-3">全体スコア</h3>
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
        <p className="text-sm text-muted-foreground mt-2">
          {summary?.data?.overview}
        </p>
      </div>

      <div className="p-4 border rounded-md">
        <h3 className="font-medium mb-3">5次元スコア</h3>
        <ResponsiveContainer width="100%" height={260}>
          <RadarChart data={scores}>
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
      </div>

      <div className="md:col-span-2 p-4 border rounded-md">
        <h3 className="font-medium mb-3">提案</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-medium">強み</h4>
            <ul className="list-disc pl-5 space-y-1">
              {details?.data?.advantages?.map((x, i) => (
                <li key={`adv-${i}`}>{x}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium">弱み</h4>
            <ul className="list-disc pl-5 space-y-1">
              {details?.data?.disadvantages?.map((x, i) => (
                <li key={`dis-${i}`}>{x}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium">面接対策</h4>
            <ul className="list-disc pl-5 space-y-2">
              {details?.data?.advice?.map((item, i) => (
                <li key={`advv-${i}`}>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {item.detail}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function normalizeScores(
  scores: number[] | Record<string, number> | undefined
) {
  const keys = ["A", "B", "C", "D", "E"];
  if (!scores) return keys.map(k => ({ name: k, value: 0 }));
  if (Array.isArray(scores)) {
    return keys.map((k, i) => ({ name: k, value: Number(scores[i] ?? 0) }));
  }
  return Object.entries(scores).map(([name, value]) => ({
    name,
    value: Number(value),
  }));
}
