/**
 * @file route.ts
 * @description GET endpoint to fetch all cached scoring results from database (batch + single).
 * @description データベースからキャッシュされた全スコアリング結果を取得するGETエンドポイント（バッチ＋単一）。
 * @author Virginia Zhang
 * @remarks Server-side API route for retrieving all persisted scoring results regardless of source.
 * @remarks ソースに関係なくすべての永続化されたスコアリング結果を取得するサーバーサイドAPIルート。
 */

import { createClient } from "@/lib/supabase/server";
import type { MatchResultItem } from "@/types/matching";
import { type NextRequest } from "next/server";

/**
 * @description Response structure for batch cache endpoint
 * @description バッチキャッシュエンドポイントのレスポンス構造
 */
interface BatchCacheResponse {
  results: MatchResultItem[];
}

/**
 * @description Handles GET requests to fetch all cached scoring results (batch and single).
 * @description すべてのキャッシュされたスコアリング結果（バッチおよび単一）を取得するGETリクエストを処理。
 * @param request The Next.js request object
 * @param request Next.jsのリクエストオブジェクト
 * @returns JSON response with all cached scoring results regardless of source
 * @returns ソースに関係なくすべてのキャッシュされたスコアリング結果を含むJSONレスポンス
 */
export async function GET(request: NextRequest) {
  try {
    // Extract resumeId from query parameters
    // クエリパラメータからresumeIdを抽出
    const searchParams = request.nextUrl.searchParams;
    const resumeId = searchParams.get("resumeId");

    if (!resumeId) {
      return Response.json(
        { error: "Missing resumeId query parameter" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Query all scoring results for this resume (regardless of source: batch or single)
    // このレジュメのすべてのスコアリング結果をクエリ（ソースに関係なく：バッチまたは単一）
    const { data: matchResults, error } = await supabase
      .from("match_results")
      .select("job_id, data")
      .eq("resume_id", resumeId)
      .eq("type", "scoring")
      .eq("version", "v2");

    if (error) {
      console.error("Failed to fetch batch cache:", error);
      return Response.json(
        { error: "Failed to fetch cached results" },
        { status: 500 }
      );
    }

    // Transform database results to MatchResultItem format
    // データベース結果をMatchResultItem形式に変換
    const results: MatchResultItem[] = (matchResults || []).map((row) => {
      const data = row.data as { overall: number; scores: MatchResultItem["scores"] };
      return {
        job_id: row.job_id,
        overall: data.overall,
        scores: data.scores,
      };
    });

    const response: BatchCacheResponse = {
      results,
    };

    return Response.json(response);
  } catch (error) {
    console.error("Batch cache API error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


