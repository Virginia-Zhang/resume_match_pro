/**
 * @file s3.ts
 * @description Minimal S3 JSON/Text helpers (Put/Get) using AWS SDK v3.
 * @description AWS SDK v3 を用いた最小限のS3 JSON/テキストのヘルパー（Put/Get）。
 * @author Virginia Zhang
 * @remarks Server-only. Reads env: AWS_REGION, S3_BUCKET, S3_PREFIX. Avoid client exposure.
 * @remarks サーバー専用。環境変数: AWS_REGION, S3_BUCKET, S3_PREFIX を読み取る。クライアントで公開しない。
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

const REGION = process.env.AWS_REGION || "";
const BUCKET = process.env.S3_BUCKET || "";
const PREFIX = (process.env.S3_PREFIX || "").replace(/\/$/, "");

function assertServerEnv(): void {
  if (!REGION || !BUCKET) {
    // Ensure env is configured on server
    // サーバーで環境変数が設定されていることを確認
    throw new Error("Missing AWS_REGION or S3_BUCKET env var");
  }
}

let _client: S3Client | null = null;
function client(): S3Client {
  if (_client) return _client;
  assertServerEnv();
  _client = new S3Client({ region: REGION });
  return _client;
}

function withPrefix(key: string): string {
  const clean = key.replace(/^\//, "");
  return PREFIX ? `${PREFIX}/${clean}` : clean;
}

/**
 * @description Put UTF-8 text to S3.
 * @description UTF-8テキストをS3へ保存。
 */
export async function putText(
  key: string,
  text: string,
  contentType = "text/plain; charset=utf-8"
): Promise<void> {
  await client().send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: withPrefix(key),
      Body: text,
      ContentType: contentType,
    })
  );
}

/**
 * @description Get UTF-8 text from S3.
 * @description S3からUTF-8テキストを取得。
 */
export async function getText(key: string): Promise<string | null> {
  try {
    const out = await client().send(
      new GetObjectCommand({ Bucket: BUCKET, Key: withPrefix(key) })
    );
    const body = await out.Body?.transformToString("utf-8");
    return body ?? null;
  } catch (err: unknown) {
    const e = err as { $metadata?: { httpStatusCode?: number }; name?: string };
    if (e?.$metadata?.httpStatusCode === 404 || e?.name === "NoSuchKey")
      return null;
    throw err;
  }
}

/**
 * @description Put JSON to S3.
 * @description JSONをS3へ保存。
 */
export async function putJson<T>(key: string, data: T): Promise<void> {
  const body = JSON.stringify(data);
  await putText(key, body, "application/json; charset=utf-8");
}

/**
 * @description Get JSON from S3.
 * @description S3からJSONを取得。
 */
export async function getJson<T>(key: string): Promise<T | null> {
  const body = await getText(key);
  if (body == null) return null;
  return JSON.parse(body) as T;
}

/**
 * @description Helper to build cache key path.
 * @description キャッシュキーのパスを作成するヘルパー。
 */
export function cacheKey(
  jobId: string,
  phase: "summary" | "details",
  resumeHash: string
): string {
  return `cache/${jobId}/${phase}/${resumeHash}.json`;
}

/**
 * @description Resume storage key builder.
 * @description 履歴書の保存キー作成。
 */
export function resumeKey(resumeId: string): string {
  return `resume/${resumeId}.txt`;
}
