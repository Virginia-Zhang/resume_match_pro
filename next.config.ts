import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable React Strict Mode in development to avoid double-invoked effects
  // 開発モードでの二重実行を避けるため React Strict Mode を無効化
  reactStrictMode: false,
  
  // Suppress Next.js development log file errors
  // Next.js 開発ログファイルエラーを抑制
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
  
};

export default nextConfig;
