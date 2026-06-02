import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloud Run 向けに自己完結バイナリ（standalone）を出力する。
  output: "standalone",
  // pg はサーバー専用。バンドルせず Node ランタイムで require させる。
  serverExternalPackages: ["pg"],
  // カバー画像は GCS 公開バケットに格納される。next/image の最適化を許可する。
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/vets-biz-aigen-apps-blog-images/**",
      },
    ],
  },
};

export default nextConfig;
