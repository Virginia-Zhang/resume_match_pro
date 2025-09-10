/**
 * @file route.ts
 * @description Jobs list mock API returning JobDetailV2[]
 * @description JobDetailV2[] を返す求人一覧モックAPI
 */
import { NextResponse } from "next/server";
import { jobsMock } from "./mock";

export async function GET(): Promise<Response> {
  return NextResponse.json(jobsMock);
}
