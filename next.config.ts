import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable React Strict Mode in development to avoid double-invoked effects
  // 開発モードでの二重実行を避けるため React Strict Mode を無効化
  reactStrictMode: false,
};

export default nextConfig;
