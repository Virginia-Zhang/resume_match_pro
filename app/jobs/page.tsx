/**
 * @file page.tsx
 * @description Jobs list page: renders mock jobs and links to details with resumeId & resumeHash.
 * @description 求人一覧ページ：モック求人を表示し、resumeId と resumeHash を付けて詳細へ遷移。
 * @author Virginia Zhang
 * @remarks Server component. Data can later switch to ISR. Content in Japanese for mock.
 * @remarks サーバーコンポーネント。後でISRに切替可能。モックは日本語表記。
 */

import { JobListItem } from "@/types/jobs";
import React from "react";
import Image from "next/image";
import { fetchJobs, toListItem } from "@/lib/jobs";
import SaveSelectedJobLink from "./SaveSelectedJobLink";
import { ROUTE_JOBS } from "@/app/constants/constants";
// redirect imported earlier is not used after client-guard refactor
// クライアントガードへのリファクタ後、redirect は未使用
import ResumeGate from "@/components/guards/ResumeGate";

/**
 * Compact relative time (weeks) for job postedAt.
 * 求人の掲載からの経過時間（週）を簡易表示。
 *
 * @param {string} iso ISO timestamp
 * @returns {string} e.g., "3 weeks ago"
 */
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const weeks = Math.floor(diff / (7 * 24 * 3600 * 1000));
  return `${weeks} weeks ago`;
}

/**
 * Jobs listing server component wrapped by client ResumeGuard.
 * クライアントの ResumeGuard でラップされた求人一覧サーバーコンポーネント。
 *
 * @returns {Promise<React.JSX.Element>} Jobs list markup / 求人一覧のマークアップ
 */
export default async function JobsPage(): Promise<React.JSX.Element> {
  // Use runtime-config to decide base URL per environment
  const details = await fetchJobs();
  const jobs: JobListItem[] = details.map(toListItem);

  return (
    <ResumeGate variant="list">
      <div className="mx-auto max-w-4xl 2xl:max-w-[75vw] p-6 space-y-6">
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
              <SaveSelectedJobLink
                className="text-primary underline"
                job={details.find(d => d.id === j.id)!}
                href={`${ROUTE_JOBS}/${encodeURIComponent(j.id)}`}
              >
                詳細を見る
              </SaveSelectedJobLink>
            </li>
          ))}
        </ul>
      </div>
    </ResumeGate>
  );
}
