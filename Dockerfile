# syntax=docker/dockerfile:1
# =============================================================================
# AI Journal (ai-blog) — Cloud Run 向け multi-stage Dockerfile
# Next.js standalone 出力（next.config.ts: output: "standalone"）を利用。
# =============================================================================

# ---- deps: 依存関係のみインストール ----------------------------------------
FROM node:22-alpine AS deps
WORKDIR /app
# Alpine で一部ネイティブモジュールに必要
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci

# ---- builder: アプリをビルド ------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# DATABASE_URL は実行時にのみ必要（全ページ force-dynamic のためビルド時 DB 接続なし）
RUN npm run build

# ---- runner: 本番実行（最小イメージ）---------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# 非 root ユーザーで実行
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# standalone 出力と静的アセットをコピー
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# standalone のエントリポイント
CMD ["node", "server.js"]
