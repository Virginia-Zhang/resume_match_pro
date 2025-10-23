/**
 * @file jobs.ts
 * @description Utilities to derive list items from JobDetailV2 and fetch helpers.
 * @description JobDetailV2 から一覧用データを導出するユーティリティと取得ヘルパー。
 */
import type { JobListItem, JobDetailV2 } from "@/types/jobs_v2";
import { fetchJson } from "@/lib/fetcher";
import { getApiBase } from "@/lib/runtime-config";

export function toListItem(detail: JobDetailV2): JobListItem {
  return {
    id: detail.id,
    title: detail.title,
    company: detail.company,
    location: detail.location,
    tags: detail.tags,
    postedAt: detail.postedAt,
    logoUrl: detail.logoUrl,
    recruitFromOverseas: detail.recruitFromOverseas,
  };
}

export async function fetchJobs(apiBase = ""): Promise<JobDetailV2[]> {
  const base = getApiBase(apiBase);
  const url = `${base}/api/jobs`;
  return fetchJson<JobDetailV2[]>(url);
}

export async function fetchJobById(
  id: string,
  apiBase = ""
): Promise<JobDetailV2 | null> {
  const base = getApiBase(apiBase);
  const url = `${base}/api/jobs/${encodeURIComponent(id)}`;
  try {
    return await fetchJson<JobDetailV2>(url);
  } catch {
    return null;
  }
}

/**
 * @description Serialize JobDetailV2 to optimized text for batch matching with LLM
 * @description バッチマッチング用に JobDetailV2 を最適化テキストに変換（LLM用）
 * @param j JobDetailV2 object to serialize / 変換する JobDetailV2 オブジェクト
 * @returns Optimized job description string / 最適化された求人説明文字列
 * @author Virginia Zhang
 * @remarks Excludes location and salary, keeps full MUST requirements, truncates other fields
 * @remarks 場所と給与を除外、必須要件は完全保持、他フィールドは短縮
 */
export function serializeJDForBatchMatching(j: JobDetailV2): string {
  const lines: string[] = [];
  
  // 1. Basic info (minimal - no location, no salary)
  // 基本情報（最小限 - 場所と給与を除く）
  lines.push(`# ${j.title} @ ${j.company}`);
  if (j.category) lines.push(`Category: ${j.category}`);
  
  // Language requirements and overseas recruitment
  // 言語要件と海外採用可否
  if (j.languageRequirements) {
    lines.push(`Language: JA=${j.languageRequirements.ja}, EN=${j.languageRequirements.en}`);
  }
  lines.push(`Recruit from overseas: ${j.recruitFromOverseas ? "Yes" : "No"}`);
  
  // 2. Responsibilities (truncated to 150 chars each)
  // 職務内容（各150文字に短縮）
  if (j.description.responsibilities?.length) {
    lines.push("\n## Responsibilities");
    j.description.responsibilities.forEach(r => {
      const short = r.length > 150 ? r.substring(0, 150) + "..." : r;
      lines.push(`- ${short}`);
    });
  }
  
  // 3. Tech Stack (concise)
  // 技術スタック（簡潔版）
  lines.push("\n## Tech Stack");
  const techItems: string[] = [];
  
  if (j.devInfo?.frontEnd) {
    const fe = j.devInfo.frontEnd;
    if (fe.languages?.length) techItems.push(`FE: ${fe.languages.join(", ")}`);
    if (fe.frameworks?.length) techItems.push(`Framework: ${fe.frameworks.join(", ")}`);
  }
  if (j.devInfo?.backEnd) {
    const be = j.devInfo.backEnd;
    if (be.languages?.length) techItems.push(`BE: ${be.languages.join(", ")}`);
    if (be.frameworks?.length) techItems.push(`Framework: ${be.frameworks.join(", ")}`);
  }
  if (j.devInfo?.database?.length) {
    techItems.push(`DB: ${j.devInfo.database.join(", ")}`);
  }
  
  if (techItems.length) lines.push(techItems.join(" | "));
  
  // 4. Infrastructure (concise)
  // インフラ（簡潔版）
  if (j.devInfo?.infra) {
    const infra = j.devInfo.infra;
    const infraItems: string[] = [];
    if (infra.cloud?.length) infraItems.push(`Cloud: ${infra.cloud.join(", ")}`);
    if (infra.containers?.length) infraItems.push(`Container: ${infra.containers.join(", ")}`);
    if (infra.monitoring?.length) infraItems.push(`Monitor: ${infra.monitoring.join(", ")}`);
    if (infraItems.length) {
      lines.push(`Infra: ${infraItems.join(" | ")}`);
    }
  }
  
  // 5. Tools (concise)
  // ツール（簡潔版）
  if (j.devInfo?.tools) {
    const tools = j.devInfo.tools;
    const allTools: string[] = [];
    if (tools.repository?.length) allTools.push(...tools.repository);
    if (tools.communication?.length) allTools.push(...tools.communication);
    if (tools.taskManagement?.length) allTools.push(...tools.taskManagement);
    if (allTools.length) {
      lines.push(`Tools: ${allTools.join(", ")}`);
    }
  }
  
  // 6. Requirements - MUST (ALL items, FULL text)
  // 必須要件（全て、完全なテキスト）
  if (j.requirements?.must?.length) {
    lines.push("\n## Requirements MUST");
    j.requirements.must.forEach(m => {
      lines.push(`- ${m}`);
    });
  }
  
  // 7. Requirements - WANT (ALL items, truncated to 120 chars)
  // 歓迎要件（全て、120文字に短縮）
  if (j.requirements?.want?.length) {
    lines.push("\n## Requirements WANT");
    j.requirements.want.forEach(w => {
      const short = w.length > 120 ? w.substring(0, 120) + "..." : w;
      lines.push(`- ${short}`);
    });
  }
  
  // 8. Candidate Requirements (truncated to 100 chars)
  // 求める人物像（100文字に短縮）
  if (j.candidateRequirements?.length) {
    lines.push("\n## Candidate");
    j.candidateRequirements.forEach(c => {
      const short = c.length > 100 ? c.substring(0, 100) + "..." : c;
      lines.push(`- ${short}`);
    });
  }
  
  return lines.join("\n");
}
