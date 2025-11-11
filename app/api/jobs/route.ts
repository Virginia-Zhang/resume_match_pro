/**
 * @file route.ts
 * @description Jobs list API returning JobDetailV2[] from Supabase
 * @description Supabase から JobDetailV2[] を返す求人一覧API
 * @author Virginia Zhang
 */
import type { DbJobRecord } from "@/lib/db-to-types";
import { dbJobToJobDetailV2 } from "@/lib/db-to-types";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * @description GET handler for jobs list API
 * @description 求人一覧APIのGETハンドラー
 * @returns JobDetailV2[] as JSON response
 * @returns JobDetailV2[] をJSONレスポンスとして返す
 */
export async function GET(): Promise<Response> {
  try {
    const supabase = await createClient();

    // Query all jobs from Supabase
    // Supabase からすべての求人を取得
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .order("posted_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch jobs", details: error.message },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json([]);
    }

    // Convert database records to JobDetailV2[]
    // データベースレコードを JobDetailV2[] に変換
    const jobs = data.map((record: DbJobRecord) =>
      dbJobToJobDetailV2(record)
    );

    return NextResponse.json(jobs);
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
