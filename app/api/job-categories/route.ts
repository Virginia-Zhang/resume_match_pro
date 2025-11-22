/**
 * @file route.ts
 * @description Job categories API returning categories from Supabase
 * @description Supabase から求人カテゴリを返すAPI
 * @author Virginia Zhang
 */
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * @description Job category type from database
 * @description データベースからの求人カテゴリ型
 */
export interface JobCategory {
  label: string;
  value: string;
}

/**
 * @description GET handler for job categories API
 * @description 求人カテゴリAPIのGETハンドラー
 * @returns JobCategory[] as JSON response
 * @returns JobCategory[] をJSONレスポンスとして返す
 */
export async function GET(): Promise<Response> {
  try {
    const supabase = await createClient();

    // Query all job categories from Supabase
    // Supabase からすべての求人カテゴリを取得
    const { data, error } = await supabase
      .from("job_categories")
      .select("code, name")
      .order("sort_order", { ascending: true })
      .order("code", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch job categories", details: error.message },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json([]);
    }

    // Return categories as array of { label, value }
    // カテゴリを { label, value } の配列として返す
    // Map database fields: name -> label, code -> value
    // データベースフィールドのマッピング：name -> label, code -> value
    const categories: JobCategory[] = data.map((item) => ({
      label: item.name,
      value: item.code,
    }));

    return NextResponse.json(categories);
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

