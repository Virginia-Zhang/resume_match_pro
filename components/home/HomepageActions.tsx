/**
 * @file HomepageActions.tsx
 * @description Client CTA buttons for upload and jobs navigation, with localStorage gating.
 * @description クライアントCTAボタン。アップロード/求人への遷移と localStorage によるガードを提供します。
 * @author Virginia Zhang
 * @remarks Uses shadcn/ui Button. Disables jobs button when `resume:current` is absent.
 * @remarks shadcn/ui の Button を使用。`resume:current` がない場合、求人ボタンを無効化します。
 */
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { resumePointer } from "@/lib/storage";
import {
  ROUTE_UPLOAD,
  ROUTE_JOBS,
  CTA_UPLOAD_JA,
  CTA_UPLOADED_JA,
} from "@/app/constants/constants";

/**
 * @component HomepageActions
 * @description Renders two CTA buttons with proper gating and navigation.
 * @description 2つのCTAボタンをレンダリングし、ガードと遷移を実装します。
 */
export default function HomepageActions(): React.ReactElement {
  const router = useRouter();
  const [hasResume, setHasResume] = React.useState<boolean>(false);

  React.useEffect(() => {
    // Check presence of resume pointer in localStorage on mount
    // マウント時に localStorage のポインタ有無を確認
    const p = resumePointer.load();
    setHasResume(Boolean(p?.resumeId));
  }, []);

  return (
    <div className="flex flex-wrap gap-4 justify-center px-4 w-full lg:w-auto">
      <Button
        onClick={() => router.push(ROUTE_UPLOAD)}
        className="h-12 sm:h-14 md:h-16 px-6 sm:px-8 md:px-10 text-base sm:text-lg md:text-xl font-rounded font-semibold rounded-full bg-sky-500 text-white hover:bg-sky-600 shadow-[0_8px_0_0_rgba(0,0,0,0.08)] hover:shadow-[0_10px_0_0_rgba(0,0,0,0.10)] transition-all sm:max-w-[90vw] lg:max-w-none"
      >
        {CTA_UPLOAD_JA}
      </Button>
      <Button
        variant="secondary"
        className="h-12 sm:h-14 md:h-16 px-6 sm:px-8 md:px-10 text-base sm:text-lg md:text-xl font-rounded font-semibold rounded-full bg-white/90 dark:bg-slate-800/70 text-slate-900 dark:text-slate-100 border border-slate-300/70 dark:border-slate-600/60 hover:bg-white dark:hover:bg-slate-800 shadow-[0_8px_0_0_rgba(0,0,0,0.05)] hover:shadow-[0_10px_0_0_rgba(0,0,0,0.08)] transition-all sm:max-w-[90vw] lg:max-w-none"
        disabled={!hasResume}
        aria-disabled={!hasResume}
        onClick={() => hasResume && router.push(ROUTE_JOBS)}
      >
        {CTA_UPLOADED_JA}
      </Button>
    </div>
  );
}
