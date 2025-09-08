/**
 * @file fetcher.ts
 * @description Minimal fetch wrappers with timeout and JSON/text helpers for both client and server.
 * @description クライアントとサーバーの両方で使用できる、タイムアウト付きの最小フェッチラッパーおよびJSON/テキストヘルパー。
 * @author Virginia Zhang
 * @remarks Runs in client or server. Does not expose secrets; callers pass headers explicitly.
 * @remarks クライアント/サーバー両対応。秘密情報は公開しないため、呼び出し側でヘッダーを渡す。
 */

export interface TimeoutOptions extends RequestInit {
  timeoutMs?: number;
}

/**
 * @description Fetch with AbortController timeout.
 * @description AbortControllerのタイムアウト付きフェッチ。
 * @param url Request URL
 * @param options Request options with optional timeoutMs
 * @returns Response object
 * @throws Timeout or network errors
 * @throws タイムアウトまたはネットワークエラー
 */
export async function fetchWithTimeout(
  url: string,
  options: TimeoutOptions = {}
): Promise<Response> {
  const { timeoutMs = 15000, signal, ...init } = options;
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);
  try {
    // Prefer caller signal linkage when provided
    const linked = signal ? new AbortController() : null;
    if (linked && signal) {
      signal.addEventListener("abort", () => linked.abort(), { once: true });
    }
    const response = await fetch(url, {
      ...init,
      signal: linked ? linked.signal : ac.signal,
    });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * @description Fetch JSON with timeout and automatic JSON.parse.
 * @description タイムアウト付きでJSONを取得し、自動でJSON.parseする。
 * @param url Request URL
 * @param options Request options with optional timeoutMs
 * @returns Parsed JSON
 */
export async function fetchJson<T = unknown>(
  url: string,
  options: TimeoutOptions = {}
): Promise<T> {
  const res = await fetchWithTimeout(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  if (!res.ok) {
    // Include body text for diagnosis
    const text = await safeReadText(res);
    // エラーメッセージに本文を含める
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`);
  }
  return (await res.json()) as T;
}

/**
 * @description Fetch text with timeout.
 * @description タイムアウト付きでテキストを取得。
 */
export async function fetchText(
  url: string,
  options: TimeoutOptions = {}
): Promise<string> {
  const res = await fetchWithTimeout(url, options);
  if (!res.ok) {
    const text = await safeReadText(res);
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`);
  }
  return res.text();
}

async function safeReadText(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return "<no-body>";
  }
}
