/**
 * @file page.tsx
 * @description Jobs list page: renders mock jobs and links to details with resumeId & resumeHash.
 * @description 求人一覧ページ：モック求人を表示し、resumeId と resumeHash を付けて詳細へ遷移。
 * @author Virginia Zhang
 * @remarks Server component. Data can later switch to ISR. Content in Japanese for mock.
 * @remarks サーバーコンポーネント。後でISRに切替可能。モックは日本語表記。
 */

import Link from "next/link";
import { JobListItem } from "@/types/jobs";
import React from "react";
import Image from "next/image";

function getMockJobs(): JobListItem[] {
  return [
    {
      id: "kraken-se-1",
      title: "シニアフロントエンドソフトウェアエンジニア",
      company: "Kraken",
      location: "東京都, 日本",
      tags: ["frontend"],
      postedAt: new Date(Date.now() - 28 * 24 * 3600 * 1000).toISOString(),
      logoUrl: "/file.svg",
    },
    {
      id: "kinto-fe-1",
      title: "フロントエンドデベロッパー（MaaSサービス）",
      company: "KINTO Technologies",
      location: "東京都, 日本",
      tags: ["frontend"],
      postedAt: new Date(Date.now() - 21 * 24 * 3600 * 1000).toISOString(),
      logoUrl: "/globe.svg",
    },
    {
      id: "trustana-fe-fullstack-1",
      title: "シニアフロントエンドエンジニア（フルスタック）",
      company: "Trustana",
      location: "東京都, 日本",
      tags: ["frontend"],
      postedAt: new Date(Date.now() - 21 * 24 * 3600 * 1000).toISOString(),
      logoUrl: "/next.svg",
    },
  ];
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const weeks = Math.floor(diff / (7 * 24 * 3600 * 1000));
  return `${weeks} weeks ago`;
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams?: Promise<{ resumeId?: string; resumeHash?: string }>;
}): Promise<React.JSX.Element> {
  const params = await searchParams;
  const resumeId = params?.resumeId || "";
  const resumeHash = params?.resumeHash || "";
  const jobs = getMockJobs();

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">求人一覧</h1>
      <ul className="divide-y">
        {jobs.map(j => (
          <li key={j.id} className="py-4 flex items-center gap-4">
            <Image
              src={j.logoUrl}
              alt={j.company}
              width={40}
              height={40}
              className="h-10 w-10 rounded"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-medium truncate">{j.title}</h2>
                <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800">
                  {j.tags[0]}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {j.company} ・ {j.location}
              </p>
              <p className="text-xs text-muted-foreground">
                {timeAgo(j.postedAt)}
              </p>
            </div>
            <Link
              className="text-primary underline"
              href={`/jobs/${encodeURIComponent(
                j.id
              )}?resumeId=${encodeURIComponent(
                resumeId
              )}&resumeHash=${encodeURIComponent(resumeHash)}`}
            >
              詳細を見る
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
