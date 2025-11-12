/**
 * @file route.ts
 * @description Job detail API returning JobDetailV2 from Supabase by id
 * @description Supabase から ID で JobDetailV2 を返す求人詳細API
 * @author Virginia Zhang
 */
import { SUPABASE_ERROR_NO_ROWS } from "@/app/constants/constants";
import type { DbJobRecord } from "@/lib/db-to-types";
import { dbJobToJobDetailV2 } from "@/lib/db-to-types";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * @description GET handler for job detail API
 * @description 求人詳細APIのGETハンドラー
 * @param req Request object
 * @param req リクエストオブジェクト
 * @param params Route parameters
 * @param params ルートパラメータ
 * @returns JobDetailV2 as JSON response or 404 if not found
 * @returns JobDetailV2 をJSONレスポンスとして返す、見つからない場合は404
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Query job by id from Supabase
    // Supabase から ID で求人を取得
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      // If no rows returned, return 404
      // 行が返されない場合は404を返す
      if (error.code === SUPABASE_ERROR_NO_ROWS) {
        return NextResponse.json(
          { error: "Job not found" },
          { status: 404 }
        );
      }

      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch job", details: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    // Convert database record to JobDetailV2
    // データベースレコードを JobDetailV2 に変換
    const job = dbJobToJobDetailV2(data as DbJobRecord);

    return NextResponse.json(job);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

