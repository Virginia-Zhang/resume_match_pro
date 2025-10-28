/**
 * @file route.ts
 * @description Unified match API: handles both summary and details requests with S3 cache.
 * @description 統合マッチAPI：S3キャッシュ付きでサマリーと詳細の両方のリクエストを処理。
 * @author Virginia Zhang
 * @remarks Server route for unified AI matching. Supports both summary and details analysis.
 * @remarks 統合AIマッチング用サーバールート。サマリーと詳細分析の両方をサポート。
 */

import { sha256Hex } from "@/lib/hash";
import {
  cacheKey,
  getJson,
  getText,
  isS3Configured,
  putJson,
  resumeKey,
} from "@/lib/s3";
import type {
  BaseRequestBody,
  DetailsData,
  MatchEnvelope,
  MatchType,
  SummaryData,
} from "@/types/matching";
import { NextRequest, NextResponse } from "next/server";

/**
 * @description Validates request parameters based on match type
 * @description マッチタイプに基づいてリクエストパラメータを検証
 * @param body Request body to validate
 * @param body 検証するリクエストボディ
 * @param type Match type (summary or details)
 * @param type マッチタイプ（サマリーまたは詳細）
 * @returns Validation error message or null if valid
 * @returns 検証エラーメッセージまたは有効な場合はnull
 */
function validateRequest(body: BaseRequestBody, type: MatchType): string | null {
  const jobId = (body.jobId || "").toString();
  const jobDesc = (body.inputs?.job_description || "").toString();
  
  if (!jobId || !jobDesc) {
    return "Missing jobId or job_description";
  }

  if (type === "details") {
    const overallFromSummary = body.inputs?.overall_from_summary;
    if (overallFromSummary === undefined) {
      return "Missing overall_from_summary for details request";
    }
  }

  return null;
}

/**
 * @description Parses Dify workflow response for summary data
 * @description サマリーデータ用にDifyワークフロー応答を解析
 * @param outputs Raw outputs from Dify workflow
 * @param outputs Difyワークフローからの生の出力
 * @returns Parsed summary data
 * @returns 解析されたサマリーデータ
 */
function parseSummaryData(outputs: Record<string, unknown>): SummaryData {
  const overall = Number((outputs as { overall?: unknown }).overall ?? 0);
  const rawScores = (outputs as { scores?: Record<string, unknown> }).scores;
  const scores: Record<string, number> = {};
  
  if (rawScores && typeof rawScores === "object") {
    for (const [key, value] of Object.entries(rawScores)) {
      const num = Number(value);
      if (!Number.isNaN(num)) {
        scores[key] = num;
      }
    }
  }
  
  return { overall, scores };
}

/**
 * @description Parses Dify workflow response for details data
 * @description 詳細データ用にDifyワークフロー応答を解析
 * @param outputs Raw outputs from Dify workflow
 * @param outputs Difyワークフローからの生の出力
 * @returns Parsed details data
 * @returns 解析された詳細データ
 */
function parseDetailsData(outputs: Record<string, unknown>): DetailsData {
  const advantages = (outputs.advantages as string[]) || [];
  const disadvantages = (outputs.disadvantages as string[]) || [];
  const adviceRaw = (outputs.advice as Array<Record<string, unknown>>) || [];
  const advice = adviceRaw
    .map(it => ({
      title: String(it.title ?? ""),
      detail: String(it.detail ?? ""),
    }))
    .filter(it => it.title || it.detail);
  const overview = (outputs.overview as string) || "";
  
  return { advantages, disadvantages, advice, overview };
}

/**
 * @description Handles POST requests for unified match API
 * @description 統合マッチAPIのPOSTリクエストを処理
 * @param req Next.js request object
 * @param req Next.jsリクエストオブジェクト
 * @returns Next.js response object with match results
 * @returns マッチ結果を含むNext.jsレスポンスオブジェクト
 * @remarks Supports both summary and details analysis through type parameter
 * @remarks タイプパラメータを通じてサマリーと詳細分析の両方をサポート
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Extract type parameter from URL
    // URLからタイプパラメータを抽出
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") as MatchType;
    
    if (!type || !["summary", "details"].includes(type)) {
      return NextResponse.json(
        { error: "Missing or invalid type parameter. Must be 'summary' or 'details'" },
        { status: 400 }
      );
    }

    const body = (await req.json()) as BaseRequestBody;
    
    // Validate request parameters
    // リクエストパラメータを検証
    const validationError = validateRequest(body, type);
    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      );
    }

    const jobId = (body.jobId || "").toString();
    const jobDesc = (body.inputs?.job_description || "").toString();

    // Resume text must be retrieved from S3
    // レジュメテキストはS3から取得する必要がある
    if (!body.resumeId) {
      return NextResponse.json({ error: "Missing resumeId" }, { status: 400 });
    }

    if (!isS3Configured()) {
      return NextResponse.json(
        { error: "S3 is not configured" },
        { status: 500 }
      );
    }

    const resumeText = await getText(resumeKey(body.resumeId.toString()));
    if (!resumeText) {
      return NextResponse.json(
        { error: "Resume not found in S3" },
        { status: 404 }
      );
    }

    const resumeHash = await sha256Hex(resumeText);

    // Dify configuration is required
    // Dify 設定は必須
    const difyUrl = process.env.DIFY_WORKFLOW_URL || "";
    const apiKey = process.env.DIFY_API_KEY || "";
    const difyUser = process.env.DIFY_USER || "ResumeMatch Pro User";

    if (!difyUrl || !apiKey) {
      return NextResponse.json({ error: "Missing Dify env" }, { status: 500 });
    }

    // Check cache
    // キャッシュをチェック
    const key = cacheKey(jobId, type, resumeHash);
    if (isS3Configured()) {
      const cached = await getJson<MatchEnvelope<any>>(key);
      // Version check: only use v2 cached data (data structure changed for summary and details APIs, v1 cache invalidated)
      // バージョンチェック：v2 バージョンのキャッシュのみを使用
      if (cached && cached.meta?.version === "v2") {
        return NextResponse.json(cached);
      }
    }

    // Build Dify request body based on type
    // タイプに基づいてDifyリクエストボディを構築
    const difyRequestBody: any = {
      inputs: {
        resume_text: resumeText,
        job_description: jobDesc,
      },
      response_mode: "blocking",
      user: difyUser,
    };

    // Add type-specific parameters
    // タイプ固有のパラメータを追加
    if (type === "details") {
      difyRequestBody.inputs.overall_from_summary = body.inputs?.overall_from_summary;
    }

    // Call Dify Workflow (non-streaming)
    // Difyワークフローを呼び出す（非ストリーミング）
    const res = await fetch(difyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(difyRequestBody),
    });

    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      return NextResponse.json(
        { error: `Dify HTTP ${res.status}: ${msg}` },
        { status: 502 }
      );
    }

    const payload = await res.json();
    // Parse Dify workflow response: expect data.outputs to contain fields
    // Dify ワークフロー応答を解析: data.outputs 内のフィールドを利用
    const outputs = (payload?.data?.outputs ?? {}) as Record<string, unknown>;

    // Parse data based on type
    // タイプに基づいてデータを解析
    let data: SummaryData | DetailsData;
    
    if (type === "summary") {
      data = parseSummaryData(outputs);
    } else {
      data = parseDetailsData(outputs);
    }

    const envelope: MatchEnvelope<SummaryData | DetailsData> = {
      meta: {
        jobId,
        resumeHash,
        source: "dify",
        timestamp: new Date().toISOString(),
        version: "v2",
        type,
      },
      data,
    };

    // Cache the result if S3 is configured
    // S3が設定されている場合は結果をキャッシュ
    if (isS3Configured()) {
      await putJson(key, envelope);
    }
    
    return NextResponse.json(envelope);
  } catch (error) {
    console.error(`Match ${req.url} API error:`, error);
    return NextResponse.json(
      {
        error: `Match ${req.url} failed`,
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
