"use client";

import Link from "next/link";
import React from "react";
import type { JobDetailV2 } from "@/types/jobs_v2";

/**
 * @component SaveSelectedJobLink
 * @description Save selected job to sessionStorage for instant detail hydration, then navigate.
 * @description 選択した求人を sessionStorage に保存してから遷移し、詳細を即時ハイドレートします。
 */
export default function SaveSelectedJobLink({
  href,
  job,
  className,
  children,
}: {
  href: string;
  job: JobDetailV2;
  className?: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <Link
      className={className}
      href={href}
      onClick={() => {
        // Use setTimeout to defer storage operation and not block navigation
        // ナビゲーションをブロックしないよう、ストレージ操作を遅延実行
        setTimeout(() => {
          try {
            sessionStorage.setItem(`job:${job.id}`, JSON.stringify(job));
          } catch {
            // ignore storage errors
          }
        }, 0);
      }}
    >
      {children}
    </Link>
  );
}
