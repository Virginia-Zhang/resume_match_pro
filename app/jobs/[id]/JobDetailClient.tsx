/**
 * @file JobDetailClient.tsx
 * @description Client-side job detail view that fetches JobDetailV2 from mock data and renders with match results
 * @description モックデータから JobDetailV2 を取得し、マッチング結果と共に描画するクライアント側求人詳細ビュー
 * @author Virginia Zhang
 * @remarks Client component for job detail page with AI matching results
 * @remarks AI マッチング結果付きの求人詳細ページ用クライアントコンポーネント
 */
"use client";

import type { JobDetailV2 } from "@/types/jobs_v2";
import type { MatchResultItem } from "@/types/matching";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ROUTE_JOBS } from "@/app/constants/constants";
import React from "react";
import Charts from "./charts";
import { serializeJDForBatchMatching } from "@/lib/jobs";
import { findJobById } from "@/app/api/jobs/mock";
import JobDetailSkeleton from "@/components/skeleton/JobDetailSkeleton";

interface JobDetailClientProps {
  jobId: string;
  resumeId?: string;
}

/**
 * @component JobDetailClient
 * @description Client component that renders job details from mock data with skeletons
 * @description モックデータから求人詳細を読み込み、スケルトン付きで描画するクライアントコンポーネント
 */
export default function JobDetailClient({
  jobId,
  resumeId,
}: JobDetailClientProps): React.ReactElement {
  const [detail, setDetail] = React.useState<JobDetailV2 | null>(null);
  const [matchResult, setMatchResult] = React.useState<MatchResultItem | null>(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  React.useEffect(() => {
    // Get matchResult from URL query params
    // URL クエリパラメータから matchResult を取得
    const matchResultParam = searchParams.get('matchResult');
    if (matchResultParam) {
      try {
        const parsed = JSON.parse(matchResultParam) as MatchResultItem;
        setMatchResult(parsed);
      } catch (error) {
        console.error('Failed to parse matchResult:', error);
      }
    }

    // Fetch job detail from mock data
    // モックデータから求人詳細を取得
    const jobDetail = findJobById(jobId);
    if (jobDetail) {
      setDetail(jobDetail);
    }
    setLoading(false);
  }, [jobId, searchParams]);

  React.useEffect(() => {
    if (!loading && !detail) {
      // Missing data -> redirect to jobs list while preserving resume context
      // データがない場合はレジュメコンテキストを保持したまま一覧へ遷移
      const params = new URLSearchParams();
      if (resumeId) params.set("resumeId", resumeId);
      const query = params.toString();
      router.push(`${ROUTE_JOBS}${query ? `?${query}` : ""}`);
    }
  }, [loading, detail, resumeId, router]);

  if (loading) {
    return <JobDetailSkeleton />;
  }

  if (!detail) return <></>;

  return (
    <div className="mx-auto max-w-4xl 2xl:max-w-[75vw] p-6 space-y-8">
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
          <div className="mt-2 flex flex-wrap gap-2">
            {detail.tags?.map(t => (
              <span
                key={t}
                className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* Employment & Work Style */}
      {/* 雇用・働き方 */}
      <section className="space-y-2">
        <h2 className="text-lg font-medium">雇用・働き方</h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          {detail.salary && <div>年収: {detail.salary}</div>}
          {detail.employmentType && (
            <div>雇用形態: {detail.employmentType}</div>
          )}
          {detail.interviewType && <div>面接形態: {detail.interviewType}</div>}
          {detail.remotePolicy && (
            <div>
              リモート: 海外から
              {detail.remotePolicy.fromOverseas ? "可" : "不可"}
              ・国内{detail.remotePolicy.fromJapan ? "可" : "不可"}
            </div>
          )}
          {detail.languageRequirements && (
            <div>
              言語要件: 日本語 {detail.languageRequirements.ja} ・ 英語{" "}
              {detail.languageRequirements.en}
            </div>
          )}
          <div>
            海外採用: {detail.recruitFromOverseas ? "可" : "不可"}
          </div>
        </div>
      </section>

      {/* Description (Important Information) */}
      {/* 説明（重要情報） */}
      <section className="space-y-2">
        <h2 className="text-lg font-medium">説明</h2>
        {detail.description.whoWeAre && (
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">私たちについて</h3>
            <p className="text-sm leading-7 whitespace-pre-line">
              {detail.description.whoWeAre}
            </p>
          </div>
        )}
        {detail.description.products && (
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">製品・サービス</h3>
            <p className="text-sm leading-7 whitespace-pre-line">
              {detail.description.products}
            </p>
          </div>
        )}
        {detail.description.productIntro && (
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">製品紹介</h3>
            <p className="text-sm leading-7 whitespace-pre-line">
              {detail.description.productIntro}
            </p>
            {/* Company/Product Images */}
            {/* 会社・製品画像 */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(index => (
                <div
                  key={index}
                  className="relative aspect-video rounded-lg overflow-hidden border"
                >
                  <Image
                    src={`/company${index}.webp`}
                    alt={`会社・製品画像${index}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Job Responsibilities */}
      {/* 職務内容 */}
      <section className="space-y-2">
        <h2 className="text-lg font-medium">職務内容</h2>
        <ul className="list-disc pl-6 space-y-1">
          {detail.description.responsibilities.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </section>

      {/* Development Information (Full Version) */}
      {/* 開発情報（完全版） */}
      {detail.devInfo && (
        <section className="space-y-2">
          <h2 className="text-lg font-medium">開発情報</h2>
          <div className="space-y-4 text-sm">
            {detail.devInfo.frontEnd && (
              <div className="p-3 border rounded-md">
                <h3 className="font-medium mb-2">フロントエンド</h3>
                <div className="grid md:grid-cols-2 gap-2">
                  {detail.devInfo.frontEnd.languages?.length && (
                    <div>
                      <span className="text-xs text-muted-foreground">
                        言語:
                      </span>
                      <div>{detail.devInfo.frontEnd.languages.join(", ")}</div>
                    </div>
                  )}
                  {detail.devInfo.frontEnd.frameworks?.length && (
                    <div>
                      <span className="text-xs text-muted-foreground">
                        フレームワーク:
                      </span>
                      <div>{detail.devInfo.frontEnd.frameworks.join(", ")}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
            {detail.devInfo.backEnd && (
              <div className="p-3 border rounded-md">
                <h3 className="font-medium mb-2">バックエンド</h3>
                <div className="grid md:grid-cols-2 gap-2">
                  {detail.devInfo.backEnd.languages?.length && (
                    <div>
                      <span className="text-xs text-muted-foreground">
                        言語:
                      </span>
                      <div>{detail.devInfo.backEnd.languages.join(", ")}</div>
                    </div>
                  )}
                  {detail.devInfo.backEnd.frameworks?.length && (
                    <div>
                      <span className="text-xs text-muted-foreground">
                        フレームワーク:
                      </span>
                      <div>{detail.devInfo.backEnd.frameworks.join(", ")}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
            {detail.devInfo.database?.length && (
              <div className="p-3 border rounded-md">
                <h3 className="font-medium mb-2">データベース</h3>
                <div>{detail.devInfo.database.join(", ")}</div>
              </div>
            )}
            {detail.devInfo.infra && (
              <div className="p-3 border rounded-md">
                <h3 className="font-medium mb-2">インフラ</h3>
                <div className="grid md:grid-cols-3 gap-2">
                  {detail.devInfo.infra.cloud?.length && (
                    <div>
                      <span className="text-xs text-muted-foreground">
                        クラウド:
                      </span>
                      <div>{detail.devInfo.infra.cloud.join(", ")}</div>
                    </div>
                  )}
                  {detail.devInfo.infra.containers?.length && (
                    <div>
                      <span className="text-xs text-muted-foreground">
                        コンテナ:
                      </span>
                      <div>{detail.devInfo.infra.containers.join(", ")}</div>
                    </div>
                  )}
                  {detail.devInfo.infra.monitoring?.length && (
                    <div>
                      <span className="text-xs text-muted-foreground">
                        監視:
                      </span>
                      <div>{detail.devInfo.infra.monitoring.join(", ")}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
            {detail.devInfo.tools && (
              <div className="p-3 border rounded-md">
                <h3 className="font-medium mb-2">ツール</h3>
                <div className="grid md:grid-cols-2 gap-2">
                  {detail.devInfo.tools.repository?.length && (
                    <div>
                      <span className="text-xs text-muted-foreground">
                        リポジトリ:
                      </span>
                      <div>{detail.devInfo.tools.repository.join(", ")}</div>
                    </div>
                  )}
                  {detail.devInfo.tools.documentation?.length && (
                    <div>
                      <span className="text-xs text-muted-foreground">
                        ドキュメント:
                      </span>
                      <div>{detail.devInfo.tools.documentation.join(", ")}</div>
                    </div>
                  )}
                  {detail.devInfo.tools.communication?.length && (
                    <div>
                      <span className="text-xs text-muted-foreground">
                        コミュニケーション:
                      </span>
                      <div>{detail.devInfo.tools.communication.join(", ")}</div>
                    </div>
                  )}
                  {detail.devInfo.tools.taskManagement?.length && (
                    <div>
                      <span className="text-xs text-muted-foreground">
                        タスク管理:
                      </span>
                      <div>
                        {detail.devInfo.tools.taskManagement.join(", ")}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            {detail.devInfo.methodology && (
              <div className="p-3 border rounded-md">
                <h3 className="font-medium mb-2">開発手法</h3>
                <div>{detail.devInfo.methodology}</div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Application Requirements */}
      {/* 応募要件 */}
      {detail.requirements && (
        <section className="space-y-2">
          <h2 className="text-lg font-medium">要件</h2>
          {detail.requirements.must?.length ? (
            <div>
              <div className="text-sm font-medium mt-1">必須</div>
              <ul className="list-disc pl-6 text-sm space-y-1">
                {detail.requirements.must.map((m, i) => (
                  <li key={`must-${i}`}>{m}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {detail.requirements.want?.length ? (
            <div>
              <div className="text-sm font-medium mt-2">歓迎</div>
              <ul className="list-disc pl-6 text-sm space-y-1">
                {detail.requirements.want.map((w, i) => (
                  <li key={`want-${i}`}>{w}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      )}

      {/* Ideal Candidate Profile */}
      {/* 求める人物像 */}
      {detail.candidateRequirements?.length && (
        <section className="space-y-2">
          <h2 className="text-lg font-medium">求める人物像</h2>
          <ul className="list-disc pl-6 space-y-1">
            {detail.candidateRequirements.map((req, i) => (
              <li key={i}>{req}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Working Conditions */}
      {/* 勤務条件 */}
      {detail.workingConditions && (
        <section className="space-y-2">
          <h2 className="text-lg font-medium">勤務条件</h2>
          <div className="space-y-3 text-sm">
            {detail.workingConditions.workingLocation && (
              <div>
                <span className="font-medium">勤務地:</span>{" "}
                {detail.workingConditions.workingLocation}
              </div>
            )}
            {detail.workingConditions.access?.length && (
              <div>
                <span className="font-medium">アクセス:</span>
                <ul className="list-disc pl-6 mt-1">
                  {detail.workingConditions.access.map((acc, i) => (
                    <li key={i}>{acc}</li>
                  ))}
                </ul>
              </div>
            )}
            {detail.workingConditions.workingHours && (
              <div>
                <span className="font-medium">勤務時間:</span>{" "}
                {detail.workingConditions.workingHours}
              </div>
            )}
            {detail.workingConditions.workSystem && (
              <div>
                <span className="font-medium">勤務制度:</span>{" "}
                {detail.workingConditions.workSystem}
              </div>
            )}
            {detail.workingConditions.probation && (
              <div>
                <span className="font-medium">試用期間:</span>{" "}
                {detail.workingConditions.probation}
              </div>
            )}
            {detail.workingConditions.benefits?.length && (
              <div>
                <span className="font-medium">福利厚生:</span>
                <ul className="list-disc pl-6 mt-1">
                  {detail.workingConditions.benefits.map((benefit, i) => (
                    <li key={i}>{benefit}</li>
                  ))}
                </ul>
              </div>
            )}
            {detail.workingConditions.remoteNote && (
              <div>
                <span className="font-medium">リモートワーク:</span>{" "}
                {detail.workingConditions.remoteNote}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Portfolio Submission */}
      {/* ポートフォリオ提出 */}
      {detail.portfolioNote?.length && (
        <section className="space-y-2">
          <h2 className="text-lg font-medium">ポートフォリオ提出</h2>
          <ul className="list-disc pl-6 space-y-1">
            {detail.portfolioNote.map((note, i) => (
              <li key={i}>{note}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Selection Process */}
      {/* 選考プロセス */}
      {detail.selectionProcess?.length && (
        <section className="space-y-2">
          <h2 className="text-lg font-medium">選考プロセス</h2>
          <div className="space-y-2">
            {detail.selectionProcess.map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-sm font-medium w-6">{i + 1}.</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* AI Analysis Results Area */}
      {/* AI分析結果エリア */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            AI（GPT-5）適合度分析レポート
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            レジュメと求人情報を基にしたリアルタイム分析結果
          </p>
        </div>

        <Charts
          resumeId={resumeId || ""}
          jobId={jobId}
          jobDescription={serializeJDForBatchMatching(detail)}
          overallScore={matchResult?.overall}
          scores={matchResult?.scores}
        />
      </section>
    </div>
  );
}

