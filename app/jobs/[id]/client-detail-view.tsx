/**
 * @file client-detail-view.tsx
 * @description Client-side detail view that hydrates JobDetailV2 from sessionStorage and renders.
 * @description クライアント側詳細ビュー。sessionStorage から JobDetailV2 を読み込み描画します。
 */
"use client";

import Skeleton from "@/components/ui/skeleton";
import type { JobDetailV2 } from "@/types/jobs_v2";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import ClientCharts from "./charts";

/**
 * Serialize JobDetailV2 to plain text for LLM analysis
 * LLM分析のためのJobDetailV2のプレーンテキストシリアライズ
 */
function serializeJDFromV2(j: JobDetailV2): string {
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

  // Description (include all fields under description)
  lines.push("\n## Description");
  if (j.description.whoWeAre) {
    lines.push("### WhoWeAre");
    lines.push(j.description.whoWeAre);
  }
  if (j.description.products) {
    lines.push("### Products");
    lines.push(j.description.products);
  }
  if (j.description.productIntro) {
    lines.push("### ProductIntro");
    lines.push(j.description.productIntro);
  }
  if (j.description.responsibilities?.length) {
    lines.push("### Responsibilities");
    j.description.responsibilities.forEach(r => lines.push(`- ${r}`));
  }

  // Dev info (compact)
  if (j.devInfo) {
    lines.push("\n## DevInfo");
    if (j.devInfo.frontEnd) {
      const fe = j.devInfo.frontEnd;
      if (fe.languages?.length)
        lines.push(`fe.languages=${fe.languages.join(", ")}`);
      if (fe.frameworks?.length)
        lines.push(`fe.frameworks=${fe.frameworks.join(", ")}`);
      if (fe.wasm?.length && !fe.wasm.includes("なし"))
        lines.push(`fe.wasm=${fe.wasm.join(", ")}`);
      if (fe.designTools?.length)
        lines.push(`fe.designTools=${fe.designTools.join(", ")}`);
    }
    if (j.devInfo.backEnd) {
      const be = j.devInfo.backEnd;
      if (be.languages?.length)
        lines.push(`be.languages=${be.languages.join(", ")}`);
      if (be.frameworks?.length)
        lines.push(`be.frameworks=${be.frameworks.join(", ")}`);
    }
    if (j.devInfo.database?.length)
      lines.push(`database=${j.devInfo.database.join(", ")}`);
    if (j.devInfo.infra) {
      const infra = j.devInfo.infra;
      if (infra.cloud?.length) lines.push(`cloud=${infra.cloud.join(", ")}`);
      if (infra.containers?.length)
        lines.push(`containers=${infra.containers.join(", ")}`);
      if (infra.monitoring?.length)
        lines.push(`monitoring=${infra.monitoring.join(", ")}`);
    }
    if (j.devInfo.tools) {
      const tools = j.devInfo.tools;
      if (tools.repository?.length)
        lines.push(`repoTools=${tools.repository.join(", ")}`);
      if (tools.documentation?.length)
        lines.push(`docsTools=${tools.documentation.join(", ")}`);
      if (tools.communication?.length)
        lines.push(`commTools=${tools.communication.join(", ")}`);
      if (tools.taskManagement?.length)
        lines.push(`taskTools=${tools.taskManagement.join(", ")}`);
    }
    if (j.devInfo.methodology)
      lines.push(`methodology=${j.devInfo.methodology}`);
  }

  // Requirements
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

  // Candidate
  if (j.candidateRequirements?.length) {
    lines.push("\n## Candidate");
    j.candidateRequirements.forEach(c => lines.push(`- ${c}`));
  }

  // Exclude workingConditions and selectionProcess from serialization per spec

  return lines.join("\n");
}

/**
 * Client component that renders job details from sessionStorage with skeletons
 * sessionStorageから求人詳細を読み込み、スケルトン付きで描画するクライアントコンポーネント
 */
export default function ClientDetailView({
  jobId,
  resumeId,
  resumeHash,
}: {
  jobId: string;
  resumeId: string;
  resumeHash: string;
}): React.ReactElement {
  const [detail, setDetail] = React.useState<JobDetailV2 | null>(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    // Use setTimeout to defer sessionStorage read and not block initial render
    // 初期レンダーをブロックしないよう、sessionStorage読み取りを遅延実行
    setTimeout(() => {
      try {
        const cached = sessionStorage.getItem(`job:${jobId}`);
        if (cached) {
          const v2 = JSON.parse(cached) as JobDetailV2;
          setDetail(v2);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }, 0);
  }, [jobId]);

  React.useEffect(() => {
    if (!loading && !detail) {
      // Missing data -> redirect to jobs list while preserving resume context
      // データがない場合は履歴書コンテキストを保持したまま一覧へ遷移
      const params = new URLSearchParams();
      if (resumeId) params.set("resumeId", resumeId);
      if (resumeHash) params.set("resumeHash", resumeHash);
      const query = params.toString();
      router.push(`/jobs${query ? `?${query}` : ""}`);
    }
  }, [loading, detail, resumeId, resumeHash, router]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl p-6 space-y-8">
        <header className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <div className="mt-2 flex gap-2">
              <Skeleton className="h-5 w-14" />
              <Skeleton className="h-5 w-14" />
              <Skeleton className="h-5 w-14" />
            </div>
          </div>
        </header>

        <section className="space-y-2">
          <Skeleton className="h-5 w-20" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-10/12" />
            <Skeleton className="h-4 w-9/12" />
            <Skeleton className="h-4 w-8/12" />
          </div>
        </section>

        <section className="space-y-2">
          <Skeleton className="h-5 w-20" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-9/12" />
            <Skeleton className="h-4 w-10/12" />
            <Skeleton className="h-4 w-8/12" />
          </div>
        </section>

        <section className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <Skeleton className="h-4 w-7/12" />
            <Skeleton className="h-4 w-7/12" />
            <Skeleton className="h-4 w-7/12" />
            <Skeleton className="h-4 w-7/12" />
          </div>
        </section>

        <section className="space-y-2">
          <Skeleton className="h-5 w-16" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-10/12" />
            <Skeleton className="h-4 w-9/12" />
            <Skeleton className="h-4 w-9/12" />
          </div>
        </section>

        <section className="space-y-6">
          <div className="text-center">
            <Skeleton className="h-7 w-64 mx-auto" />
            <Skeleton className="h-4 w-80 mx-auto mt-2" />
          </div>
          {/* charts skeleton is already inside charts.tsx when loading */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
          </div>
        </section>
      </div>
    );
  }

  if (!detail) return <></>;

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
        </div>
      </section>

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

      {/* 職務内容 */}
      <section className="space-y-2">
        <h2 className="text-lg font-medium">職務内容</h2>
        <ul className="list-disc pl-6 space-y-1">
          {detail.description.responsibilities.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </section>

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
                  {detail.devInfo.frontEnd.wasm?.length &&
                    !detail.devInfo.frontEnd.wasm.includes("なし") && (
                      <div>
                        <span className="text-xs text-muted-foreground">
                          WebAssembly:
                        </span>
                        <div>{detail.devInfo.frontEnd.wasm.join(", ")}</div>
                      </div>
                    )}
                  {detail.devInfo.frontEnd.designTools?.length && (
                    <div>
                      <span className="text-xs text-muted-foreground">
                        デザインツール:
                      </span>
                      <div>
                        {detail.devInfo.frontEnd.designTools.join(", ")}
                      </div>
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

      {/* AI分析結果エリア */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            AI（GPT-5）適合度分析レポート
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            履歴書と求人情報を基にしたリアルタイム分析結果
          </p>
        </div>

        <ClientCharts
          resumeId={resumeId}
          resumeHash={resumeHash}
          jobId={jobId}
          jobDescription={serializeJDFromV2(detail)}
        />
      </section>
    </div>
  );
}
