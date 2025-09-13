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
import { redirect } from "next/navigation";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const weeks = Math.floor(diff / (7 * 24 * 3600 * 1000));
  return `${weeks} weeks ago`;
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams?: Promise<{ resumeId?: string }>;
}): Promise<React.JSX.Element> {
  const params = await searchParams;
  const resumeId = params?.resumeId;

  // Strict flow guard: must have resumeId from upload flow
  // 厳格なフローガード：アップロードフローから resumeId が必要
  if (!resumeId) {
    redirect("/upload");
  }

  // Use runtime-config to decide base URL per environment
  const details = await fetchJobs();
  const jobs: JobListItem[] = details.map(toListItem);

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
            <SaveSelectedJobLink
              className="text-primary underline"
              job={details.find(d => d.id === j.id)!}
              href={`/jobs/${encodeURIComponent(
                j.id
              )}?resumeId=${encodeURIComponent(resumeId!)}`}
            >
              詳細を見る
            </SaveSelectedJobLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
