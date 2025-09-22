/**
 * @file ResumeGate.tsx
 * @description Minimal client-only gate: checks `localStorage` key `resume:current`; shows Skeleton then redirect to /upload when missing.
 * @description 最小のクライアントゲート。`localStorage` の `resume:current` を確認し、無ければ Skeleton 表示後 /upload へ遷移。
 */
"use client";

import React from "react";
import Skeleton from "@/components/ui/skeleton";
import { resumePointer } from "@/lib/storage";
import { ROUTE_UPLOAD } from "@/app/constants/constants";

/**
 * Minimal client-only gate component.
 * 最小のクライアントゲートコンポーネント。
 */
type ResumeGatePropsBase = {
  variant: "list" | "detail";
  children: React.ReactNode;
  injectResumeId?: false;
};

type ResumeGatePropsWithInject = {
  variant: "list" | "detail";
  children: React.ReactElement<{ resumeId: string }>;
  injectResumeId: true;
};

type ResumeGateProps = ResumeGatePropsBase | ResumeGatePropsWithInject;

export default function ResumeGate({
  variant,
  children,
  injectResumeId = false,
}: ResumeGateProps): React.ReactElement {
  const [ok, setOk] = React.useState<boolean | null>(null);
  const [resumeId, setResumeId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const p = resumePointer.load();
    if (!p?.resumeId) {
      setOk(false);
      const t = setTimeout(() => window.location.replace(ROUTE_UPLOAD), 300);
      return () => clearTimeout(t);
    }
    setResumeId(p.resumeId);
    setOk(true);
  }, []);

  if (ok !== true) return <GateSkeleton variant={variant} />;
  if (injectResumeId && React.isValidElement(children) && resumeId) {
    const child = children as React.ReactElement<{ resumeId: string }>;
    return React.cloneElement(child, { resumeId });
  }
  return <>{children}</>;
}

function GateSkeleton({ variant }: { variant: "list" | "detail" }) {
  if (variant === "detail") {
    return (
      <div className="mx-auto max-w-4xl p-6 space-y-6">
        <Skeleton className="h-10 w-2/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-4xl p-6 space-y-6">
      <Skeleton className="h-8 w-40" />
      <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  );
}
