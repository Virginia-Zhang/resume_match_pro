/**
 * @file route.ts
 * @description Match details API: resolves advantages, disadvantages, and advice with S3 cache.
 * @description マッチ詳細API：強み・弱み・面接対策をS3キャッシュ付きで返す。
 * @author Virginia Zhang
 * @remarks Server route. Accepts { resumeId, jobId, job_description, phase? } or { resume_text, ... }.
 * @remarks サーバールート。{ resumeId, jobId, job_description, phase? } または { resume_text, ... } を受け付ける。
 */

import { NextRequest, NextResponse } from "next/server";
import { cacheKey, getJson, putJson, getText, resumeKey } from "@/lib/s3";
import { sha256Hex } from "@/lib/hash";

type Phase = "summary" | "details";

interface BodyA {
  resumeId: string;
  resumeHash?: string;
  jobId: string;
  job_description: string;
  phase?: Phase; // default "details"
}

interface BodyB {
  resume_text: string;
  jobId: string;
  job_description: string;
  phase?: Phase; // default "details"
}

interface DetailsData {
  advantages: string[];
  disadvantages: string[];
  advice: Array<{
    title: string;
    detail: string;
  }>;
}

interface Envelope {
  meta: {
    jobId: string;
    phase: Phase;
    resumeHash: string;
    source: "cache" | "dify";
    timestamp: string;
    version: "v1";
  };
  data: DetailsData;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as Partial<BodyA & BodyB>;

    const jobId = (body.jobId || "").toString();
    const jobDesc = (body.job_description || "").toString();
    const phase: Phase = (body.phase as Phase) || "details";
    if (!jobId || !jobDesc) {
      return NextResponse.json(
        { error: "Missing jobId or job_description" },
        { status: 400 }
      );
    }

    let resumeText: string | null = null;
    let resumeHash: string | undefined = body.resumeHash as string | undefined;

    if ("resume_text" in body && body.resume_text) {
      resumeText = body.resume_text.toString();
      resumeHash = await sha256Hex(resumeText);
    } else if ("resumeId" in body && body.resumeId) {
      // 开发模式：从内存中获取 mock 数据
      // 開発モード：メモリからモックデータを取得
      if (process.env.NODE_ENV === "development") {
        const globalStorage = global as typeof globalThis & {
          mockResumeStorage?: Map<string, string>;
        };
        resumeText =
          globalStorage.mockResumeStorage?.get(body.resumeId.toString()) ||
          null;
        if (!resumeText) {
          return NextResponse.json(
            { error: "Resume not found in mock storage" },
            { status: 404 }
          );
        }
        resumeHash = (body.resumeHash as string) || "mock-hash";
      } else {
        // 生产模式：从 S3 获取
        // 本番モード：S3から取得
        resumeText = await getText(resumeKey(body.resumeId.toString()));
        if (!resumeText)
          return NextResponse.json(
            { error: "Resume not found" },
            { status: 404 }
          );
        resumeHash = await sha256Hex(resumeText);
      }
    } else {
      return NextResponse.json(
        { error: "Missing resumeId or resume_text" },
        { status: 400 }
      );
    }

    // 本地测试：返回模拟的详细分析
    // ローカルテスト：モックの詳細分析を返す
    if (process.env.NODE_ENV === "development") {
      const mockData: DetailsData = {
        advantages: [
          "React と TypeScript の実務経験が豊富",
          "チーム開発での Git 使用経験",
          "API 設計・開発の経験",
        ],
        disadvantages: [
          "AWS クラウド環境での開発経験が限定的",
          "テスト自動化の経験が不足",
        ],
        advice: [
          {
            title: "AWS クラウドスキルの向上",
            detail:
              "AWS の基本的なサービス（EC2, S3, Lambda）について学習し、クラウド環境での開発経験を積むことをお勧めします。",
          },
          {
            title: "テスト自動化の実践",
            detail:
              "Jest や Vitest を使ったテスト自動化を実践し、品質保証のスキルを向上させましょう。",
          },
          {
            title: "コンテナ技術の習得",
            detail:
              "Docker を使った開発環境構築を経験し、モダンな開発手法を身につけることをお勧めします。",
          },
        ],
      };

      const envelope: Envelope = {
        meta: {
          jobId,
          phase: "details",
          resumeHash,
          source: "dify",
          timestamp: new Date().toISOString(),
          version: "v1",
        },
        data: mockData,
      };

      return NextResponse.json(envelope);
    }

    // 生产环境：实际调用 Dify
    // 本番環境：実際にDifyを呼び出す
    const key = cacheKey(jobId, phase, resumeHash);
    const cached = await getJson<Envelope>(key);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Call Dify Workflow (non-streaming)
    // Difyワークフローを呼び出す（非ストリーミング）
    const difyUrl = process.env.DIFY_WORKFLOW_URL || "";
    const apiKey = process.env.DIFY_API_KEY || "";
    if (!difyUrl || !apiKey) {
      return NextResponse.json({ error: "Missing Dify env" }, { status: 500 });
    }

    const res = await fetch(difyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        inputs: {
          resume_text: resumeText,
          job_description: jobDesc,
          phase: "details",
        },
        response_mode: "blocking",
        user: "Virginia Zhang",
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
    const data: DetailsData = payload?.output as DetailsData;

    const envelope: Envelope = {
      meta: {
        jobId,
        phase: "details",
        resumeHash,
        source: "dify",
        timestamp: new Date().toISOString(),
        version: "v1",
      },
      data,
    };

    await putJson(key, envelope);
    return NextResponse.json(envelope);
  } catch (error) {
    console.error("❌ Match details API error:", error);
    return NextResponse.json(
      {
        error: "Match details failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
