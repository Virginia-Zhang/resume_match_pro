/**
 * @file jobs.ts
 * @description Utilities to derive list items from JobDetailV2 and fetch helpers.
 * @description JobDetailV2 から一覧用データを導出するユーティリティと取得ヘルパー。
 */
export { fetchJobById, fetchJobs } from "@/lib/api/jobs";
import type { JobDetailV2, JobListItem } from "@/types/jobs_v2";

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

/**
 * @description Truncates text to specified length with ellipsis
 * @description 指定された長さにテキストを省略記号付きで短縮
 */
function truncate(text: string, maxLength: number): string {
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
}

/**
 * @description Builds basic info section (title, company, category, language, overseas)
 * @description 基本情報セクションを構築（タイトル、会社、カテゴリ、言語、海外採用）
 */
function buildBasicInfo(j: JobDetailV2): string[] {
  const lines: string[] = [];
  lines.push(`# ${j.title} @ ${j.company}`);
  
  if (j.category) {
    lines.push(`Category: ${j.category}`);
  }
  
  if (j.languageRequirements) {
    lines.push(`Language: JA=${j.languageRequirements.ja}, EN=${j.languageRequirements.en}`);
  }
  
  lines.push(`Recruit from overseas: ${j.recruitFromOverseas ? "Yes" : "No"}`);
  return lines;
}

/**
 * @description Builds responsibilities section
 * @description 職務内容セクションを構築
 */
function buildResponsibilities(responsibilities: string[] | undefined): string[] {
  if (!responsibilities?.length) {
    return [];
  }
  
  const lines = ["\n## Responsibilities"];
  for (const r of responsibilities) {
    lines.push(`- ${truncate(r, 150)}`);
  }
  return lines;
}

/**
 * @description Builds tech stack section from devInfo
 * @description devInfo から技術スタックセクションを構築
 */
function buildTechStack(devInfo: JobDetailV2["devInfo"]): string[] {
  const lines = ["\n## Tech Stack"];
  const techItems: string[] = [];
  
  if (devInfo?.frontEnd) {
    const fe = devInfo.frontEnd;
    if (fe.languages?.length) techItems.push(`FE: ${fe.languages.join(", ")}`);
    if (fe.frameworks?.length) techItems.push(`Framework: ${fe.frameworks.join(", ")}`);
  }
  
  if (devInfo?.backEnd) {
    const be = devInfo.backEnd;
    if (be.languages?.length) techItems.push(`BE: ${be.languages.join(", ")}`);
    if (be.frameworks?.length) techItems.push(`Framework: ${be.frameworks.join(", ")}`);
  }
  
  if (devInfo?.database?.length) {
    techItems.push(`DB: ${devInfo.database.join(", ")}`);
  }
  
  if (techItems.length) {
    lines.push(techItems.join(" | "));
  }
  
  return lines;
}

/**
 * @description Builds infrastructure section from devInfo
 * @description devInfo からインフラセクションを構築
 */
function buildInfrastructure(infra: JobDetailV2["devInfo"]): string[] {
  if (!infra?.infra) {
    return [];
  }
  
  const infraData = infra.infra;
  const infraItems: string[] = [];
  
  if (infraData.cloud?.length) infraItems.push(`Cloud: ${infraData.cloud.join(", ")}`);
  if (infraData.containers?.length) infraItems.push(`Container: ${infraData.containers.join(", ")}`);
  if (infraData.monitoring?.length) infraItems.push(`Monitor: ${infraData.monitoring.join(", ")}`);
  
  if (infraItems.length) {
    return [`Infra: ${infraItems.join(" | ")}`];
  }
  
  return [];
}

/**
 * @description Builds tools section from devInfo
 * @description devInfo からツールセクションを構築
 */
function buildTools(devInfo: JobDetailV2["devInfo"]): string[] {
  if (!devInfo?.tools) {
    return [];
  }
  
  const tools = devInfo.tools;
  const allTools: string[] = [];
  
  if (tools.repository?.length) allTools.push(...tools.repository);
  if (tools.communication?.length) allTools.push(...tools.communication);
  if (tools.taskManagement?.length) allTools.push(...tools.taskManagement);
  
  if (allTools.length) {
    return [`Tools: ${allTools.join(", ")}`];
  }
  
  return [];
}

/**
 * @description Builds requirements section (MUST and WANT)
 * @description 要件セクションを構築（必須と歓迎）
 */
function buildRequirements(requirements: JobDetailV2["requirements"]): string[] {
  const lines: string[] = [];
  
  if (requirements?.must?.length) {
    lines.push("\n## Requirements MUST");
    for (const m of requirements.must) {
      lines.push(`- ${m}`);
    }
  }
  
  if (requirements?.want?.length) {
    lines.push("\n## Requirements WANT");
    for (const w of requirements.want) {
      lines.push(`- ${truncate(w, 120)}`);
    }
  }
  
  return lines;
}

/**
 * @description Builds candidate requirements section
 * @description 求める人物像セクションを構築
 */
function buildCandidateRequirements(candidateRequirements: string[] | undefined): string[] {
  if (!candidateRequirements?.length) {
    return [];
  }
  
  const lines = ["\n## Candidate"];
  for (const c of candidateRequirements) {
    lines.push(`- ${truncate(c, 100)}`);
  }
  return lines;
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
  const sections: string[][] = [
    buildBasicInfo(j),
    buildResponsibilities(j.description.responsibilities),
    buildTechStack(j.devInfo),
    buildInfrastructure(j.devInfo),
    buildTools(j.devInfo),
    buildRequirements(j.requirements),
    buildCandidateRequirements(j.candidateRequirements),
  ];
  
  return sections.flat().join("\n");
}
