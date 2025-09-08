/**
 * @file hash.ts
 * @description SHA-256 hashing utilities for text to hex/base64url.
 * @description テキストをHEX/BASE64URLに変換するSHA-256ハッシュユーティリティ。
 * @author Virginia Zhang
 * @remarks Server preferred (uses WebCrypto when available). Client-safe fallback included.
 * @remarks サーバー推奨（利用可能ならWebCryptoを使用）。クライアント安全なフォールバックを含む。
 */

/**
 * @description Compute SHA-256 and return hex string.
 * @description SHA-256を計算し、HEX文字列を返す。
 */
export async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await getSubtle().digest("SHA-256", bytes);
  return bufferToHex(digest);
}

/**
 * @description Compute SHA-256 and return base64url string.
 * @description SHA-256を計算し、base64url文字列を返す。
 */
export async function sha256Base64Url(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await getSubtle().digest("SHA-256", bytes);
  return bufferToBase64Url(digest);
}

function getSubtle(): SubtleCrypto {
  // Prefer globalThis.crypto.subtle in both Node 20+ and browsers
  if (
    typeof globalThis !== "undefined" &&
    globalThis.crypto &&
    globalThis.crypto.subtle
  ) {
    return globalThis.crypto.subtle;
  }
  // Node.js crypto WebCrypto fallback
  // Node.jsのWebCryptoフォールバック
  const { webcrypto } = require("crypto");
  return webcrypto.subtle;
}

function bufferToHex(buf: ArrayBuffer): string {
  const b = new Uint8Array(buf);
  const hex: string[] = [];
  for (let i = 0; i < b.length; i++) {
    hex.push(b[i].toString(16).padStart(2, "0"));
  }
  return hex.join("");
}

function bufferToBase64Url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let str = "";
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
  const b64 =
    typeof btoa === "function"
      ? btoa(str)
      : Buffer.from(str, "binary").toString("base64");
  return b64.replace(/=+$/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
