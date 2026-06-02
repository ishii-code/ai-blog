import { NextResponse } from "next/server";
import { getArticle } from "@/lib/db";
import type { ArticleResponse, ErrorResponse } from "@/types";

export const dynamic = "force-dynamic";

interface RouteContext {
  // Next.js 16 では params は Promise。
  params: Promise<{ id: string }>;
}

/**
 * GET /api/articles/:id
 * 単一の公開記事を返す。未存在は 404、不正な ID は 400。
 */
export async function GET(
  _request: Request,
  { params }: RouteContext,
): Promise<NextResponse> {
  const { id: rawId } = await params;

  if (!/^\d+$/.test(rawId)) {
    const body: ErrorResponse = { error: "ID は正の整数で指定してください。" };
    return NextResponse.json(body, { status: 400 });
  }
  const id = Number.parseInt(rawId, 10);
  if (!Number.isInteger(id) || id <= 0) {
    const body: ErrorResponse = { error: "ID は正の整数で指定してください。" };
    return NextResponse.json(body, { status: 400 });
  }

  try {
    const article = await getArticle(id);
    if (!article) {
      const body: ErrorResponse = { error: "記事が見つかりません。" };
      return NextResponse.json(body, { status: 404 });
    }
    const body: ArticleResponse = { article };
    return NextResponse.json(body, { status: 200 });
  } catch (error) {
    console.error(`[GET /api/articles/${id}] failed:`, error);
    const body: ErrorResponse = { error: "記事の取得に失敗しました。" };
    return NextResponse.json(body, { status: 500 });
  }
}
