import { Pool, type PoolClient, type QueryResultRow } from "pg";
import type {
  Article,
  ArticleSummary,
  ListArticlesParams,
  TagCount,
} from "@/types";

/**
 * Cloud SQL (PostgreSQL) への接続層。
 *
 * - DATABASE_URL からプールを生成（max=5）
 * - Cloud SQL は TLS 必須（sslMode=ENCRYPTED_ONLY）のため ssl を有効化
 * - rawQuery/executeRaw は使わず、Pool#query のパラメータ化クエリのみ使用
 * - Next.js の開発時 HMR で接続が枯渇しないよう globalThis にプールをキャッシュ
 */

// DB の行をそのまま受ける内部型（snake_case）。
interface BlogArticleRow extends QueryResultRow {
  id: number;
  title: string;
  content: string;
  published: boolean;
  topic_tags: unknown;
  named_entities: unknown;
  structure_type: number | null;
  source_title: string | null;
  source_url: string | null;
  cover_image_url: string | null;
  created_at: Date;
  updated_at: Date;
}

const globalForPool = globalThis as unknown as { __blogPool?: Pool };

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("環境変数 DATABASE_URL が設定されていません。");
  }

  // 接続形式に応じて SSL を自動切り替えする。
  // - Unix socket 接続（Cloud Run + Cloud SQL）: 既に暗号化済みのため SSL を無効化。
  //   socket を指定すると Postgres は "does not support SSL connections" を返す。
  // - localhost / 127.0.0.1（ローカル DB / Auth Proxy）: 平文 TCP のため SSL 無効。
  // - それ以外（パブリック IP への TCP 直結）: Cloud SQL は TLS 必須のため SSL 有効。
  //
  // 注意: Cloud Run の DATABASE_URL は host が URL エンコードされる
  // （例 `?host=%2Fcloudsql%2F...`）。デコード後の文字列でも判定する。
  const haystack = connectionString.toLowerCase();
  let decoded = haystack;
  try {
    decoded = decodeURIComponent(haystack);
  } catch {
    // パスワード等に不正な % が含まれる場合はデコード前の文字列で判定する。
  }
  const isSocketConnection =
    decoded.includes("/cloudsql/") || decoded.includes("host=/");
  const isLocalhost =
    decoded.includes("localhost") || decoded.includes("127.0.0.1");
  const useSsl = !isSocketConnection && !isLocalhost;

  return new Pool({
    connectionString,
    // パブリック IP TCP 直結時のみ TLS を有効化（マネージド証明書のため厳密検証はしない）。
    ssl: useSsl ? { rejectUnauthorized: false } : false,
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
}

export function getPool(): Pool {
  if (!globalForPool.__blogPool) {
    globalForPool.__blogPool = createPool();
  }
  return globalForPool.__blogPool;
}

/** JSONB 配列（unknown）を string[] に安全に正規化する。 */
function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
}

/** Markdown を軽く除去して一覧用の抜粋テキストを作る。 */
function buildExcerpt(content: string, maxLength = 200): string {
  const plain = content
    .replace(/```[\s\S]*?```/g, " ") // コードブロック
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // 画像
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // リンク → テキスト
    .replace(/[#>*_`~-]/g, " ") // 記号
    .replace(/\s+/g, " ")
    .trim();
  if (plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength)}…`;
}

function mapRowToArticle(row: BlogArticleRow): Article {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    published: row.published,
    topicTags: toStringArray(row.topic_tags),
    namedEntities: toStringArray(row.named_entities),
    structureType: row.structure_type,
    sourceTitle: row.source_title,
    sourceUrl: row.source_url,
    coverImageUrl: row.cover_image_url,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

function mapRowToSummary(row: BlogArticleRow): ArticleSummary {
  return {
    id: row.id,
    title: row.title,
    excerpt: buildExcerpt(row.content),
    topicTags: toStringArray(row.topic_tags),
    structureType: row.structure_type,
    coverImageUrl: row.cover_image_url,
    createdAt: row.created_at.toISOString(),
  };
}

/** limit/offset を安全な整数に丸める。 */
function sanitizeRange(limit?: number, offset?: number): {
  limit: number;
  offset: number;
} {
  const safeLimit = Number.isFinite(limit)
    ? Math.min(Math.max(Math.trunc(limit as number), 1), 100)
    : 20;
  const safeOffset = Number.isFinite(offset)
    ? Math.max(Math.trunc(offset as number), 0)
    : 0;
  return { limit: safeLimit, offset: safeOffset };
}

/**
 * 記事一覧を取得する。
 * - publishedOnly（既定 true）のとき published=true のみ
 * - tag を指定するとそのタグを topic_tags に含む記事のみ
 */
export async function listArticles(
  params: ListArticlesParams = {},
): Promise<ArticleSummary[]> {
  const { tag, publishedOnly = true } = params;
  const { limit, offset } = sanitizeRange(params.limit, params.offset);

  const conditions: string[] = [];
  const values: unknown[] = [];

  if (publishedOnly) {
    conditions.push("published = true");
  }
  if (tag && tag.trim().length > 0) {
    values.push(JSON.stringify([tag.trim()]));
    conditions.push(`topic_tags @> $${values.length}::jsonb`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  values.push(limit);
  const limitIdx = values.length;
  values.push(offset);
  const offsetIdx = values.length;

  const sql = `
    SELECT id, title, content, published, topic_tags, named_entities,
           structure_type, source_title, source_url, cover_image_url, created_at, updated_at
    FROM blog_articles
    ${where}
    ORDER BY created_at DESC, id DESC
    LIMIT $${limitIdx} OFFSET $${offsetIdx}
  `;

  const result = await getPool().query<BlogArticleRow>(sql, values);
  return result.rows.map(mapRowToSummary);
}

/**
 * 単一記事を取得する。存在しなければ null。
 * 既定では published=true のみ取得する。
 */
export async function getArticle(
  id: number,
  options: { publishedOnly?: boolean } = {},
): Promise<Article | null> {
  if (!Number.isInteger(id) || id <= 0) return null;
  const { publishedOnly = true } = options;

  const sql = `
    SELECT id, title, content, published, topic_tags, named_entities,
           structure_type, source_title, source_url, cover_image_url, created_at, updated_at
    FROM blog_articles
    WHERE id = $1 ${publishedOnly ? "AND published = true" : ""}
    LIMIT 1
  `;
  const result = await getPool().query<BlogArticleRow>(sql, [id]);
  if (result.rows.length === 0) return null;
  return mapRowToArticle(result.rows[0]);
}

interface TagCountRow extends QueryResultRow {
  tag: string;
  count: string;
}

/**
 * 公開記事に含まれる topic_tags を集計して返す（出現数の降順）。
 */
export async function listTags(): Promise<TagCount[]> {
  const sql = `
    SELECT tag, COUNT(*)::text AS count
    FROM blog_articles,
         LATERAL jsonb_array_elements_text(topic_tags) AS tag
    WHERE published = true
    GROUP BY tag
    ORDER BY COUNT(*) DESC, tag ASC
  `;
  const result = await getPool().query<TagCountRow>(sql);
  return result.rows.map((row) => ({
    tag: row.tag,
    count: Number.parseInt(row.count, 10) || 0,
  }));
}

/** ヘルスチェック用に簡易接続確認を行う。 */
export async function pingDatabase(): Promise<boolean> {
  let client: PoolClient | undefined;
  try {
    client = await getPool().connect();
    await client.query("SELECT 1");
    return true;
  } catch {
    return false;
  } finally {
    client?.release();
  }
}
