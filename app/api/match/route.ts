/**
 * @file route.ts
 * @description Unified match API: handles both scoring and details requests with database cache.
 * @description 統合マッチAPI：データベースキャッシュ付きでスコアリングと詳細の両方のリクエストを処理。
 * @author Virginia Zhang
 * @remarks Server route for unified AI matching. Supports both scoring and details analysis.
 * @remarks 統合AIマッチング用サーバールート。スコアリングと詳細分析の両方をサポート。
 */

import { sha256Hex } from "@/lib/hash";
import {
  getText,
  resumeKey,
} from "@/lib/s3";
import { createClient } from "@/lib/supabase/server";
import type {
  BaseRequestBody,
  DetailsData,
  MatchEnvelope,
  MatchType,
  ScoringData,
} from "@/types/matching";
import { NextRequest, NextResponse } from "next/server";

/**
 * @description Validates request parameters based on match type
 * @description マッチタイプに基づいてリクエストパラメータを検証
 * @param body Request body to validate
 * @param body 検証するリクエストボディ
 * @param type Match type (scoring or details)
 * @param type マッチタイプ（スコアリングまたは詳細）
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
    const overallFromScoring = body.inputs?.overall_from_scoring;
    if (overallFromScoring === undefined) {
      return "Missing overall_from_scoring for details request";
    }
  }

  return null;
}

/**
 * @description Parses Dify workflow response for scoring data
 * @description スコアリングデータ用にDifyワークフロー応答を解析
 * @param outputs Raw outputs from Dify workflow
 * @param outputs Difyワークフローからの生の出力
 * @returns Parsed scoring data
 * @returns 解析されたスコアリングデータ
 */
function parseScoringData(outputs: Record<string, unknown>): ScoringData {
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
      title: typeof it.title === "string" ? it.title : "",
      detail: typeof it.detail === "string" ? it.detail : "",
    }))
    .filter(it => it.title || it.detail);
  const overview = (outputs.overview as string) || "";
  
  return { advantages, disadvantages, advice, overview };
}

/**
 * @description Validates scoring data to ensure it's not empty/invalid
 * @description スコアリングデータが空/無効でないことを検証
 * @param data Parsed scoring data to validate
 * @param data 検証するスコアリングデータ
 * @returns Validation error message or null if valid
 * @returns 検証エラーメッセージまたは有効な場合はnull
 */
function validateScoringData(data: ScoringData): string | null {
  // Check if scores object is empty
  // scoresオブジェクトが空かチェック
  const hasScores = Object.keys(data.scores).length > 0;
  
  // Check if overall score is 0 (likely indicates LLM failure)
  // overall スコアが 0 かチェック（LLM失敗の可能性）
  const hasOverall = data.overall > 0;
  
  if (!hasScores || !hasOverall) {
    return "Invalid scoring data: LLM may have failed to generate scores. Please check OpenRouter balance or try again later.";
  }
  
  return null;
}

/**
 * @description Validates details data to ensure it's not empty/invalid
 * @description 詳細データが空/無効でないことを検証
 * @param data Parsed details data to validate
 * @param data 検証する詳細データ
 * @returns Validation error message or null if valid
 * @returns 検証エラーメッセージまたは有効な場合はnull
 */
function validateDetailsData(data: DetailsData): string | null {
  // Check if all arrays are empty (likely indicates LLM failure)
  // すべての配列が空かチェック（LLM失敗の可能性）
  const hasAdvantages = data.advantages && data.advantages.length > 0;
  const hasDisadvantages = data.disadvantages && data.disadvantages.length > 0;
  const hasAdvice = data.advice && data.advice.length > 0;
  const hasOverview = data.overview && data.overview.trim().length > 0;
  
  if (!hasAdvantages && !hasDisadvantages && !hasAdvice && !hasOverview) {
    return "Invalid details data: LLM may have failed to generate analysis. Please check OpenRouter balance or try again later.";
  }
  
  return null;
}

/**
 * @description Checks for cached match result in database
 * @description データベースでキャッシュされたマッチ結果を確認
 * @param resumeId Resume ID to check
 * @param resumeId 確認するレジュメID
 * @param jobId Job ID to check
 * @param jobId 確認するジョブID
 * @param type Match type (scoring or details)
 * @param type マッチタイプ（スコアリングまたは詳細）
 * @returns Cached envelope or null if not found
 * @returns キャッシュされたエンベロープまたは見つからない場合はnull
 */
async function checkDatabaseCache(
  resumeId: string,
  jobId: string,
  type: MatchType
): Promise<MatchEnvelope<ScoringData | DetailsData> | null> {
  try {
    const supabase = await createClient();
    const { data: resumeRecord } = await supabase
      .from("resumes")
      .select("id")
      .eq("id", resumeId)
      .single();

    if (!resumeRecord) {
      return null;
    }

    const { data: matchResult, error: matchError } = await supabase
      .from("match_results")
      .select("*")
      .eq("resume_id", resumeRecord.id)
      .eq("job_id", jobId)
      .eq("type", type)
      .eq("version", "v2")
      .order("timestamp", { ascending: false })
      .limit(1)
      .single();

    if (matchError || !matchResult) {
      return null;
    }

    return {
      meta: {
        jobId: matchResult.job_id,
        resumeHash: matchResult.resume_hash,
        source: "cache",
        timestamp: matchResult.timestamp,
        version: matchResult.version as "v1" | "v2",
        type: matchResult.type as MatchType,
      },
      data: matchResult.data as ScoringData | DetailsData,
    };
  } catch (dbError) {
    console.error("Database cache check error:", dbError);
    return null;
  }
}

/**
 * @description Stores match result in database
 * @description データベースにマッチ結果を保存
 * @param resumeId Resume ID
 * @param resumeId レジュメID
 * @param envelope Match envelope to store
 * @param envelope 保存するマッチエンベロープ
 */
async function storeMatchResult(
  resumeId: string,
  envelope: MatchEnvelope<ScoringData | DetailsData>
): Promise<void> {
  try {
    const supabase = await createClient();
    
    const { data: resumeRecord, error: resumeError } = await supabase
      .from("resumes")
      .select("id")
      .eq("id", resumeId)
      .single();

    if (resumeError || !resumeRecord) {
      console.error("Failed to find resume record:", resumeError);
      return;
    }

    const { error: matchError } = await supabase
      .from("match_results")
      .insert({
        resume_id: resumeRecord.id,
        job_id: envelope.meta.jobId,
        resume_hash: envelope.meta.resumeHash,
        source: envelope.meta.source,
        version: envelope.meta.version,
        type: envelope.meta.type,
        data: envelope.data,
        timestamp: envelope.meta.timestamp,
      });

    if (matchError) {
      console.error("Failed to store match result in database:", matchError);
    }
  } catch (dbError) {
    console.error("Database operation error:", dbError);
  }
}

/**
 * @description Calls Dify workflow API
 * @description Difyワークフロー APIを呼び出す
 * @param resumeText Resume text content
 * @param resumeText レジュメテキスト内容
 * @param jobDesc Job description
 * @param jobDesc ジョブ説明
 * @param type Match type (scoring or details)
 * @param type マッチタイプ（スコアリングまたは詳細）
 * @param overallFromScoring Overall score from scoring (for details only)
 * @param overallFromScoring スコアリングからの総合スコア（詳細のみ）
 * @returns Dify response outputs or error response
 * @returns Dify応答出力またはエラーレスポンス
 */
async function callDifyWorkflow(
  resumeText: string,
  jobDesc: string,
  type: MatchType,
  overallFromScoring?: number
): Promise<{ outputs: Record<string, unknown> } | NextResponse> {
  const difyUrl = process.env.DIFY_WORKFLOW_URL || "";
  const apiKey = process.env.DIFY_API_KEY || "";
  const difyUser = process.env.DIFY_USER || "ResumeMatch Pro User";

  if (!difyUrl || !apiKey) {
    return NextResponse.json({ error: "Missing Dify env" }, { status: 500 });
  }

  const difyInputs: Record<string, unknown> = {
    resume_text: resumeText,
    job_description: jobDesc,
  };

  if (type === "details" && typeof overallFromScoring === "number" && !Number.isNaN(overallFromScoring)) {
    difyInputs.overall_from_scoring = overallFromScoring;
  }

  const res = await fetch(difyUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      inputs: difyInputs,
      response_mode: "blocking",
      user: difyUser,
    }),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    return NextResponse.json(
      { error: `Dify HTTP ${res.status}: ${msg}` },
      { status: 502 }
    );
  }

  const payload = await res.json();
  return { outputs: (payload?.data?.outputs ?? {}) as Record<string, unknown> };
}

/**
 * @description Handles POST requests for unified match API
 * @description 統合マッチAPIのPOSTリクエストを処理
 * @param req Next.js request object
 * @param req Next.jsリクエストオブジェクト
 * @returns Next.js response object with match results
 * @returns マッチ結果を含むNext.jsレスポンスオブジェクト
 * @remarks Supports both scoring and details analysis through type parameter
 * @remarks タイプパラメータを通じてスコアリングと詳細分析の両方をサポート
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Extract type parameter from URL
    // URLからタイプパラメータを抽出
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") as MatchType;
    
    if (!type || !["scoring", "details"].includes(type)) {
      return NextResponse.json(
        { error: "Missing or invalid type parameter. Must be 'scoring' or 'details'" },
        { status: 400 }
      );
    }

    const body = (await req.json()) as BaseRequestBody;
    
    // Validate request parameters
    // リクエストパラメータを検証
    const validationError = validateRequest(body, type);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const jobId = (body.jobId || "").toString();
    const jobDesc = (body.inputs?.job_description || "").toString();
    const resumeId = body.resumeId?.toString();

    // Resume ID is required
    // レジュメIDは必須
    if (!resumeId) {
      return NextResponse.json({ error: "Missing resumeId" }, { status: 400 });
    }

    // Check database cache first
    // 最初にデータベースキャッシュを確認
    const cachedResult = await checkDatabaseCache(resumeId, jobId, type);
    if (cachedResult) {
      return NextResponse.json(cachedResult);
    }

    // Retrieve resume text from S3
    // S3からレジュメテキストを取得
    const resumeText = await getText(resumeKey(resumeId));
    if (!resumeText) {
      return NextResponse.json({ error: "Resume not found in S3" }, { status: 404 });
    }

    const resumeHash = await sha256Hex(resumeText);

    // Call Dify workflow
    // Difyワークフローを呼び出す
    const difyResult = await callDifyWorkflow(
      resumeText,
      jobDesc,
      type,
      body.inputs?.overall_from_scoring
    );

    // If difyResult is a NextResponse, return it (error case)
    // difyResultがNextResponseの場合、それを返す（エラーケース）
    if (difyResult instanceof NextResponse) {
      return difyResult;
    }

    // Parse data based on type
    // タイプに基づいてデータを解析
    const data = type === "scoring"
      ? parseScoringData(difyResult.outputs)
      : parseDetailsData(difyResult.outputs);

    // Validate parsed data to ensure LLM generated valid results
    // 解析されたデータを検証してLLMが有効な結果を生成したことを確認
    const dataValidationError = type === "scoring"
      ? validateScoringData(data as ScoringData)
      : validateDetailsData(data as DetailsData);
    
    if (dataValidationError) {
      console.error("Data validation failed:", dataValidationError, "Raw outputs:", difyResult.outputs);
      return NextResponse.json(
        { 
          error: dataValidationError,
          hint: "This usually happens when OpenRouter balance is insufficient or LLM service is unavailable."
        },
        { status: 500 }
      );
    }

    const envelope: MatchEnvelope<ScoringData | DetailsData> = {
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

    // Store result in database (non-blocking)
    // データベースに結果を保存（非ブロッキング）
    void storeMatchResult(resumeId, envelope);
    
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
