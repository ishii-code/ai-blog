import { NextResponse } from "next/server";
import { listArticles } from "@/lib/db";
import type { ArticleListResponse, ErrorResponse } from "@/types";

export const dynamic = "force-dynamic";

/** クエリ文字列を範囲チェック付きの整数に変換する。 */
function parseIntParam(
  value: string | null,
  fallback: number,
  min: number,
  max: number,
): number | null {
  if (value === null) return fallback;
  if (!/^\d+$/.test(value)) return null; // マイナス・小数・非数値を拒否
  const n = Number.parseInt(value, 10);
  if (!Number.isInteger(n) || n < min || n > max) return null;
  return n;
}

/**
 * GET /api/articles?limit=&offset=&tag=
 * 公開記事の一覧を返す。
 */
export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);

  const limit = parseIntParam(searchParams.get("limit"), 20, 1, 100);
  const offset = parseIntParam(searchParams.get("offset"), 0, 0, 100_000);

  if (limit === null || offset === null) {
    const body: ErrorResponse = {
      error: "limit は 1〜100、offset は 0 以上の整数で指定してください。",
    };
    return NextResponse.json(body, { status: 400 });
  }

  const rawTag = searchParams.get("tag");
  // タグは長さ制限を設けて DoS / 異常入力を防ぐ。
  if (rawTag !== null && rawTag.length > 100) {
    const body: ErrorResponse = { error: "tag が長すぎます（最大 100 文字）。" };
    return NextResponse.json(body, { status: 400 });
  }
  const tag = rawTag && rawTag.trim().length > 0 ? rawTag.trim() : undefined;

  try {
    const articles = await listArticles({ limit, offset, tag });
    const body: ArticleListResponse = { articles, limit, offset };
    return NextResponse.json(body, { status: 200 });
  } catch (error) {
    console.error("[GET /api/articles] failed:", error);
    const body: ErrorResponse = { error: "記事一覧の取得に失敗しました。" };
    return NextResponse.json(body, { status: 500 });
  }
}
