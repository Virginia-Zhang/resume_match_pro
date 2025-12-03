/**
 * @file charts.tsx
 * @description Client-only chart placeholders using Recharts: Donut for overall, Radar for 5-dim scores.
 * @description クライアント専用のRechartsプレースホルダー：総合スコアはドーナツ、5次元はレーダー。
 * @author Virginia Zhang
 * @remarks Client component; receives API envelopes and renders.
 * @remarks クライアントコンポーネント。APIエンベロープを受け取り描画。
 */
"use client";

import { ROUTE_UPLOAD } from "@/app/constants/constants";
import ErrorDisplay from "@/components/common/ErrorDisplay";
import ChartsDetailsSkeleton from "@/components/skeleton/ChartsDetailsSkeleton";
import ChartsSummarySkeleton from "@/components/skeleton/ChartsSummarySkeleton";
import { useMatchData } from "@/hooks/useMatchData";
import { handleRadarChartMouseMove, normalizeScores, renderOverviewText } from "@/lib/chart-utils";
import { getFriendlyErrorMessage } from "@/lib/errorHandling";
import type { ChartsProps } from "@/types/matching";
import React from "react";
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



export default function Charts(props: Readonly<ChartsProps>): React.JSX.Element {
  const {
    scoring,
    details,
    scoringLoading,
    detailsLoading,
    scoringError,
    detailsError,
    hover,
    setHover,
  } = useMatchData(props);


  // Render scoring section independently
  // スコアリングセクションを独立してレンダリング
  const renderScoringSection = () => {
    if (scoringLoading) {
      return <ChartsSummarySkeleton />;
    }

    if (scoringError) {
      return (
        <ErrorDisplay
          title="スコアリング分析エラー"
          errorInfo={getFriendlyErrorMessage(scoringError)}
          uploadRoute={ROUTE_UPLOAD}
        />
      );
    }

    if (!scoring) return null;

    const overall = Math.max(
      0,
      Math.min(100, Number(scoring?.data?.overall ?? 0))
    );
    const scores = normalizeScores(
      scoring?.data?.scores as Record<string, number> | undefined
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
                onMouseMove={state => handleRadarChartMouseMove(state, setHover, hover)}
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
              {renderOverviewText(details.data.overview)}
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
                {details.data.advantages?.map((item, index) => (
                  <li key={`advantage-${index}-${item.slice(0, 20)}`}>{item}</li>
                ))}
              </ul>
            </section>
            <section>
              <h4 className="font-medium mb-3">弱み</h4>
              <ul className="list-disc pl-5 space-y-1">
                {details.data.disadvantages?.map((item, index) => (
                  <li key={`disadvantage-${index}-${item.slice(0, 20)}`}>{item}</li>
                ))}
              </ul>
            </section>
            <section>
              <h4 className="font-medium mb-3">面接対策</h4>
              <ul className="list-disc pl-5 space-y-2">
                {details.data.advice?.map((item, index) => (
                  <li key={`advice-${index}-${item.title.slice(0, 20)}`}>
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
      {renderScoringSection()}
      {renderDetailsSection()}
    </div>
  );
}