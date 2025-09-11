/**
 * @file route.ts
 * @description Job detail mock API by id
 * @description IDで求人詳細を返すモックAPI
 */
import { NextRequest, NextResponse } from "next/server";
import { findJobById } from "../mock";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const p = await params;
  const job = findJobById(p.id);
  if (!job) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(job);
}
