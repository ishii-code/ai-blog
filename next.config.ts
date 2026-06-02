import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloud Run 向けに自己完結バイナリ（standalone）を出力する。
  output: "standalone",
  // pg はサーバー専用。バンドルせず Node ランタイムで require させる。
  serverExternalPackages: ["pg"],
};

export default nextConfig;
