/**
 * @file route.ts
 * @description Batch job matching API endpoint that processes multiple jobs sequentially using Dify workflow.
 * @description Dify ワークフローを使用して複数の求人を順次処理するバッチ求人マッチング API エンドポイント。
 * @author Virginia Zhang
 * @remarks Server-side API route for AI-powered batch job matching with sequential processing.
 * @remarks 順次処理による AI 駆動のバッチ求人マッチング用サーバーサイド API ルート。
 */

import { NextRequest, NextResponse } from "next/server";
import { MAX_BATCH_RETRIES } from "@/app/constants/constants";
import { fetchJson } from "@/lib/fetcher";
import { sha256Hex } from "@/lib/hash";
import { createClient } from "@/lib/supabase/server";

// Environment variables
// 環境変数
const DIFY_API_KEY = process.env.DIFY_API_KEY_FOR_BATCH_MATCHING;
const DIFY_WORKFLOW_URL = process.env.DIFY_WORKFLOW_URL;
const DIFY_USER = process.env.DIFY_USER;

// Request/Response interfaces
// リクエスト/レスポンスインターフェース
interface BatchMatchRequest {
  resume_text: string;
  resume_id: string;
  jobs: Array<{
    id: string;
    job_description: string;
  }>;
}

interface MatchResultItem {
  job_id: string;
  overall: number;
  scores: {
    skills: number;
    experience: number;
    projects: number;
    education: number;
    soft: number;
  };
}

interface BatchMatchResponse {
  match_results: MatchResultItem[];
}

interface DifyResponse {
  task_id: string;
  workflow_run_id: string;
  data: {
    id: string;
    workflow_id: string;
    status: string;
    outputs: {
      match_results: MatchResultItem[];
    };
    error: string;
    elapsed_time: number;
    total_tokens: number;
    total_steps: number;
    created_at: number;
    finished_at: number;
  };
}

/**
 * @description Calls Dify workflow API for batch job matching.
 * @description バッチ求人マッチングのために Dify ワークフロー API を呼び出します。
 * @param resumeText The resume text to match against jobs
 * @param resumeText 求人とマッチングする履歴書テキスト
 * @param jobs Array of jobs with id and job_description
 * @param jobs id と job_description を持つ求人の配列
 * @returns Promise resolving to Dify API response with match results
 * @returns マッチング結果を含む Dify API レスポンスを解決するプロミス
 * @throws Error if API key/URL not configured or API call fails
 * @throws API キー/URL が設定されていない場合、または API 呼び出しが失敗した場合にエラー
 */
async function callDifyAPI(
  resumeText: string,
  jobs: Array<{ id: string; job_description: string }>
): Promise<DifyResponse> {
  if (!DIFY_API_KEY || !DIFY_WORKFLOW_URL) {
    throw new Error("DIFY_API_KEY_FOR_BATCH_MATCHING or DIFY_WORKFLOW_URL not configured");
  }

  // Convert jobs array to JSON string for Dify API
  // Dify API 用に jobs 配列を JSON 文字列に変換
  const jobListJson = JSON.stringify(jobs);


  // Call Dify API using fetchJson with timeout(default 15 seconds)
  // タイムアウト付き(デフォルトの15秒)で fetchJson を使用して Dify API を呼び出し
  const data = await fetchJson<DifyResponse>(DIFY_WORKFLOW_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${DIFY_API_KEY}`,
    },
    body: JSON.stringify({
      inputs: {
        resume_text: resumeText,
        job_list_json: jobListJson,
      },
      response_mode: "blocking",
      user: DIFY_USER,
    })
  });


  if (data.data.status !== "succeeded") {
    throw new Error(`Dify workflow failed: ${data.data.error}`);
  }

  return data;
}

/**
 * @description Calls Dify API with retry mechanism for a single batch of jobs.
 * @description 単一バッチの求人に対してリトライ機能付きで Dify API を呼び出します。
 * @param resumeText The resume text to match against jobs
 * @param resumeText 求人とマッチングする履歴書テキスト
 * @param jobs Array of jobs with id and job_description
 * @param jobs id と job_description を持つ求人の配列
 * @returns Promise resolving to Dify API response with match results
 * @returns マッチング結果を含む Dify API レスポンスを解決するプロミス
 * @throws Error if API key/URL not configured or API call fails after retries
 * @throws API キー/URL が設定されていない場合、またはリトライ後も API 呼び出しが失敗した場合にエラー
 */
async function callDifyAPIWithRetry(
  resumeText: string,
  jobs: Array<{ id: string; job_description: string }>
): Promise<DifyResponse> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= MAX_BATCH_RETRIES; attempt++) {
    try {
      return await callDifyAPI(resumeText, jobs);
    } catch (error) {
      lastError = error as Error;
      if (attempt < MAX_BATCH_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  throw lastError ?? new Error("All retry attempts failed");
}

/**
 * @description Stores batch match results to database
 * @description バッチマッチング結果をデータベースに保存
 * @param resumeId Resume ID to associate with results
 * @param resumeId 結果に関連付けるレジュメID
 * @param resumeHash Hash of resume text for cache invalidation
 * @param resumeHash キャッシュ無効化のためのレジュメテキストのハッシュ
 * @param matchResults Array of match results to store
 * @param matchResults 保存するマッチング結果の配列
 */
async function storeBatchMatchResults(
  resumeId: string,
  resumeHash: string,
  matchResults: MatchResultItem[]
): Promise<void> {
  try {
    const supabase = await createClient();
    const timestamp = new Date().toISOString();

    // Insert all results in parallel for better performance
    // パフォーマンス向上のため、すべての結果を並列で挿入
    const insertPromises = matchResults.map(result =>
      supabase.from("match_results").insert({
        resume_id: resumeId,
        job_id: result.job_id,
        resume_hash: resumeHash,
        source: "batch",
        version: "v2",
        type: "scoring",
        data: {
          overall: result.overall,
          scores: result.scores,
        },
        timestamp,
      })
    );

    const results = await Promise.all(insertPromises);
    
    // Log any errors but don't fail the request
    // エラーをログに記録するが、リクエストは失敗させない
    for (const { error } of results) {
      if (error) {
        console.error("Failed to store batch match result:", error);
      }
    }
  } catch (dbError) {
    console.error("Database operation error during batch store:", dbError);
  }
}

/**
 * @description Handles POST requests for batch job matching.
 * @description バッチ求人マッチングの POST リクエストを処理します。
 * @param request The Next.js request object
 * @param request Next.js のリクエストオブジェクト
 * @returns A Next.js response object containing the batch matching results
 * @returns バッチマッチング結果を含む Next.js のレスポンスオブジェクト
 * @remarks This is a serverless function that integrates with Dify workflow for AI matching.
 * @remarks これは、AI マッチングのために Dify ワークフローと統合するサーバーレス関数です。
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    // リクエストボディを解析
    const body: BatchMatchRequest = await request.json();

    // Validate request
    // リクエストを検証
    if (!body.resume_text || !body.jobs || !Array.isArray(body.jobs)) {
      return NextResponse.json(
        { error: "Invalid request: resume_text and jobs array are required" },
        { status: 400 }
      );
    }

    // Validate resume_id for database persistence
    // データベース永続化のために resume_id を検証
    if (!body.resume_id) {
      return NextResponse.json(
        { error: "Invalid request: resume_id is required" },
        { status: 400 }
      );
    }

    // Validate jobs array
    // ジョブ配列を検証
    if (body.jobs.length === 0) {
      return NextResponse.json(
        { error: "Jobs array cannot be empty" },
        { status: 400 }
      );
    }

    // Check if any job is missing required fields
    // 必要なフィールドが不足しているジョブがないかチェック
    for (const job of body.jobs) {
      if (!job.id || !job.job_description) {
        return NextResponse.json(
          { error: "Each job must have id and job_description" },
          { status: 400 }
        );
      }
    }


    // Process single batch with retry mechanism
    // リトライ機能付きで単一バッチを処理
    const difyResponse = await callDifyAPIWithRetry(body.resume_text, body.jobs);
    const matchResults = difyResponse.data.outputs.match_results;

    // Calculate resume hash for cache invalidation
    // キャッシュ無効化のためにレジュメハッシュを計算
    const resumeHash = await sha256Hex(body.resume_text);

    // Store results to database (non-blocking)
    // データベースに結果を保存（非ブロッキング）
    void storeBatchMatchResults(body.resume_id, resumeHash, matchResults);

    // Return results in expected format
    // 期待される形式で結果を返す
    const response: BatchMatchResponse = {
      match_results: matchResults,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error("Batch matching API error:", error);
    
    // Handle timeout errors specifically
    // タイムアウトエラーを特別に処理
    if (error instanceof Error && error.name === "TimeoutError") {
      return NextResponse.json(
        { error: "Request timeout - Dify API took too long to respond" },
        { status: 408 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error during batch matching" },
      { status: 500 }
    );
  }
}
