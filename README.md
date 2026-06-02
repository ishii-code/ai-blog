# AI Journal (ai-blog)

AI が執筆した記事を閲覧するブログ。データソースは Cloud SQL (PostgreSQL) の
`spm_dev_agent.blog_articles` テーブル。UI は **peco-ui** デザインシステム準拠、
ダークモード対応。

- **Stack**: Next.js 16 (App Router) / React 19 / TypeScript / Tailwind CSS v4
- **DB**: PostgreSQL (`pg`), Cloud SQL — TLS 必須
- **UI**: peco-ui コンポーネント + デザイントークン / next-themes ダークモード
- **Markdown**: react-markdown + remark-gfm

## 機能

| パス | 説明 |
|---|---|
| `/` | 公開記事の一覧（カードグリッド: PC 3 列 / タブレット 2 列 / スマホ 1 列） |
| `/articles/[id]` | 記事詳細（Markdown 本文 + 出典 + タグ） |
| `/tags` | タグ一覧（出現数付き） |
| `/tags/[tag]` | タグ別記事一覧 |
| `GET /api/articles` | 記事一覧 API（`?limit=&offset=&tag=`） |
| `GET /api/articles/[id]` | 単一記事 API |

## セットアップ

```bash
npm install
cp .env.example .env.local   # DATABASE_URL を設定
npm run dev                  # http://localhost:3000
```

### 環境変数

| 変数 | 説明 |
|---|---|
| `DATABASE_URL` | PostgreSQL 接続文字列。**サーバー専用**（`NEXT_PUBLIC_` を付けない） |

接続は `src/lib/db.ts` で TLS を有効化（`ssl: { rejectUnauthorized: false }`）、
接続プール `max=5` / `idleTimeoutMillis=30000`。

## データモデル（`blog_articles`）

`id`, `title`, `content`(Markdown), `published`, `topic_tags`(JSONB配列),
`named_entities`(JSONB配列), `structure_type`(1-7), `source_title`, `source_url`,
`created_at`, `updated_at`。

> 注: 当初仕様の `source_urls`（JSONB 配列）は実テーブルには存在せず、
> 実際は `source_url`（単一テキスト）+ `source_title` のため、それに合わせて実装。

## ビルド / 型チェック

```bash
npx tsc --noEmit   # 型チェック
npm run build      # 本番ビルド（全ページ force-dynamic）
```

## デプロイ（Cloud Run）

全ページ `force-dynamic` のためビルド時に DB 接続は不要。`DATABASE_URL` は
実行時に Secret Manager から注入する。

```bash
# 1. ビルド & push（Artifact Registry の例）
PROJECT_ID=$(gcloud config get-value project)
REGION=asia-northeast1
IMAGE="$REGION-docker.pkg.dev/$PROJECT_ID/ai-blog/ai-blog:latest"

gcloud builds submit --tag "$IMAGE"
# またはローカルで:
#   docker build -t "$IMAGE" . && docker push "$IMAGE"

# 2. デプロイ（DATABASE_URL を Secret Manager から注入）
gcloud run deploy ai-blog \
  --image "$IMAGE" \
  --region "$REGION" \
  --platform managed \
  --port 3000 \
  --allow-unauthenticated \
  --set-secrets "DATABASE_URL=spm-dev-agent-database-url:latest"
```

Cloud SQL に Auth Proxy 経由で繋ぐ場合は `--add-cloudsql-instances <CONNECTION_NAME>`
を付け、Secret 側の `DATABASE_URL` ホストを `127.0.0.1` にする。

## ディレクトリ構成

```
src/
├── app/
│   ├── layout.tsx              # ルートレイアウト（テーマ/ヘッダ/フッタ）
│   ├── page.tsx                # 記事一覧
│   ├── loading.tsx / not-found.tsx
│   ├── articles/[id]/page.tsx  # 記事詳細
│   ├── tags/page.tsx           # タグ一覧
│   ├── tags/[tag]/page.tsx     # タグ別一覧
│   └── api/articles/...        # REST API
├── components/                 # SiteHeader/Footer, ArticleCard, Markdown, peco/*
├── lib/db.ts                   # DB 接続・クエリ
├── lib/format.ts               # 表示用ヘルパー
├── styles/tokens.css           # peco デザイントークン
└── types/index.ts              # 型定義の一元管理
```
