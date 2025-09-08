/**
 * @file page.tsx
 * @description Job detail page: shows JD mock, calls summary then details APIs, renders Recharts placeholders.
 * @description 求人詳細ページ：JDモックを表示し、summary→details API を呼び、Rechartsプレースホルダーを描画。
 * @author Virginia Zhang
 * @remarks Server component with client subcomponents for charts.
 * @remarks サーバーコンポーネント。チャートはクライアントサブコンポーネント。
 */

import React from "react";
import Image from "next/image";
import { JobDetail } from "@/types/jobs";
import ClientChartsWrapper from "./client-charts";

function getMockDetail(jobId: string): JobDetail | null {
  const base = {
    salary: "年収 450万〜1000万円",
    employmentType: "正社員",
    interviewType: "オンライン面接",
    remotePolicy: { fromOverseas: false, fromJapan: true },
    internationalTeam: {
      total: 10,
      nationalities: ["中国", "スリランカ", "米国", "スイス"],
      languageRequirement: "日本語N1",
    },
    workEnvironment: ["フルリモート可", "フレックス"],
    appealPoints: ["社会的意義", "技術的挑戦"],
    techStack: {
      languages: ["TypeScript"],
      frameworks: ["React"],
      infra: ["AWS"],
      testing: ["Vitest"],
      database: ["DynamoDB"],
      tools: ["GitHub", "Slack"],
    },
    requirements: {
      must: ["Git によるチーム開発", "型付き言語の経験", "API設計開発"],
      want: ["TypeScript 実務", "React フレームワーク経験"],
    },
    idealCandidate: ["ミッション/バリューへの共感", "学習意欲"],
    workingConditions: {
      holidays: ["土日祝"],
      welfare: ["社会保険完備"],
      coreHours: "10:00~16:00",
    },
    selectionProcess: [
      "書類選考",
      "一次面接",
      "コーディングテスト",
      "最終面接",
    ],
  };

  if (jobId === "kraken-se-1")
    return {
      id: jobId,
      title: "シニアフロントエンドソフトウェアエンジニア",
      company: "Kraken",
      location: "東京都, 日本",
      tags: ["frontend"],
      postedAt: new Date(Date.now() - 28 * 24 * 3600 * 1000).toISOString(),
      logoUrl: "/file.svg",
      description: {
        productIntro: "Loogia とは...（モック）",
        responsibilities: [
          "配送計画の作成機能の改善",
          "リアルタイム配車管理のUI改善",
        ],
      },
      ...base,
    };
  if (jobId === "kinto-fe-1")
    return {
      id: jobId,
      title: "フロントエンドデベロッパー（MaaSサービス）",
      company: "KINTO Technologies",
      location: "東京都, 日本",
      tags: ["frontend"],
      postedAt: new Date(Date.now() - 21 * 24 * 3600 * 1000).toISOString(),
      logoUrl: "/globe.svg",
      description: {
        productIntro: "Loogia とは...（モック）",
        responsibilities: ["データ連携基盤のUI", "運行管理の機能拡張"],
      },
      ...base,
    };
  if (jobId === "trustana-fe-fullstack-1")
    return {
      id: jobId,
      title: "シニアフロントエンドエンジニア（フルスタック）",
      company: "Trustana",
      location: "東京都, 日本",
      tags: ["frontend"],
      postedAt: new Date(Date.now() - 21 * 24 * 3600 * 1000).toISOString(),
      logoUrl: "/next.svg",
      description: {
        productIntro: "Loogia とは...（モック）",
        responsibilities: ["フルスタックでの機能開発", "音声ナビ機能の改善"],
      },
      ...base,
    };
  return null;
}

// Data fetching functions moved to client-side charts component
// データ取得関数はクライアントサイドのチャートコンポーネントに移動

export default async function JobDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ resumeId?: string; resumeHash?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const jobId = resolvedParams.id;
  const resumeId = resolvedSearchParams?.resumeId || "";
  const resumeHash = resolvedSearchParams?.resumeHash || "";
  const detail = getMockDetail(jobId);
  if (!detail) return <div className="p-6">求人が見つかりません</div>;

  // Data fetching is now handled by the client-side charts component
  // データ取得はクライアントサイドのチャートコンポーネントで処理

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-8">
      <header className="flex items-center gap-4">
        <Image
          src={detail.logoUrl}
          alt={detail.company}
          width={48}
          height={48}
          className="h-12 w-12 rounded"
        />
        <div>
          <h1 className="text-2xl font-semibold">{detail.title}</h1>
          <p className="text-sm text-muted-foreground">
            {detail.company} ・ {detail.location}
          </p>
        </div>
      </header>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">職務内容</h2>
        <ul className="list-disc pl-6 space-y-1">
          {detail.description.responsibilities.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </section>

      <ClientChartsWrapper
        resumeId={resumeId}
        resumeHash={resumeHash}
        jobId={jobId}
        jobDescription={serializeJD(detail)}
      />
    </div>
  );
}

function serializeJD(j: JobDetail): string {
  // Rich plain-text JD for LLM analysis
  // LLM分析のためのリッチなプレーンテキスト
  const lines: string[] = [];
  lines.push(`# Title: ${j.title}`);
  lines.push(`# Company: ${j.company}`);
  lines.push(`# Location: ${j.location}`);
  if (j.salary) lines.push(`# Salary: ${j.salary}`);
  if (j.employmentType) lines.push(`# EmploymentType: ${j.employmentType}`);
  if (j.interviewType) lines.push(`# InterviewType: ${j.interviewType}`);
  if (j.remotePolicy)
    lines.push(
      `# RemotePolicy: fromOverseas=${j.remotePolicy.fromOverseas}, fromJapan=${j.remotePolicy.fromJapan}`
    );

  // Description
  // 説明
  if (j.description.productIntro) {
    lines.push("\n## ProductIntro");
    lines.push(j.description.productIntro);
  }
  lines.push("\n## Responsibilities");
  j.description.responsibilities.forEach(r => lines.push(`- ${r}`));

  // International team
  // 国際チーム
  if (j.internationalTeam) {
    lines.push("\n## InternationalTeam");
    if (typeof j.internationalTeam.total === "number")
      lines.push(`total=${j.internationalTeam.total}`);
    if (j.internationalTeam.nationalities?.length)
      lines.push(
        `nationalities=${j.internationalTeam.nationalities.join(", ")}`
      );
    if (j.internationalTeam.languageRequirement)
      lines.push(
        `languageRequirement=${j.internationalTeam.languageRequirement}`
      );
  }

  // Tech stack
  // 技術スタック
  if (j.techStack) {
    lines.push("\n## TechStack");
    if (j.techStack.languages?.length)
      lines.push(`languages=${j.techStack.languages.join(", ")}`);
    if (j.techStack.frameworks?.length)
      lines.push(`frameworks=${j.techStack.frameworks.join(", ")}`);
    if (j.techStack.infra?.length)
      lines.push(`infra=${j.techStack.infra.join(", ")}`);
    if (j.techStack.testing?.length)
      lines.push(`testing=${j.techStack.testing.join(", ")}`);
    if (j.techStack.database?.length)
      lines.push(`database=${j.techStack.database.join(", ")}`);
    if (j.techStack.tools?.length)
      lines.push(`tools=${j.techStack.tools.join(", ")}`);
  }

  // Requirements
  // 要件
  if (j.requirements) {
    lines.push("\n## Requirements");
    if (j.requirements.must?.length) {
      lines.push("MUST:");
      j.requirements.must.forEach(m => lines.push(`- ${m}`));
    }
    if (j.requirements.want?.length) {
      lines.push("WANT:");
      j.requirements.want.forEach(w => lines.push(`- ${w}`));
    }
  }

  // Ideal candidate
  // 求める人物像
  if (j.idealCandidate?.length) {
    lines.push("\n## IdealCandidate");
    j.idealCandidate.forEach(c => lines.push(`- ${c}`));
  }

  // Working conditions brief
  // 勤務条件（概要）
  if (j.workingConditions) {
    lines.push("\n## WorkingConditions");
    if (j.workingConditions.holidays?.length)
      lines.push(`holidays=${j.workingConditions.holidays.join(", ")}`);
    if (j.workingConditions.welfare?.length)
      lines.push(`welfare=${j.workingConditions.welfare.join(", ")}`);
    if (j.workingConditions.coreHours)
      lines.push(`coreHours=${j.workingConditions.coreHours}`);
    if (j.workingConditions.remoteNote)
      lines.push(`remoteNote=${j.workingConditions.remoteNote}`);
  }

  return lines.join("\n");
}
