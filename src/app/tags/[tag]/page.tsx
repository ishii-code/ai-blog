import Link from "next/link";
import type { Metadata } from "next";
import { listArticles } from "@/lib/db";
import { ArticleCard } from "@/components/ArticleCard";
import { PecoEmptyState } from "@/components/peco";
import { DbErrorState } from "@/components/DbErrorState";
import type { ArticleSummary } from "@/types";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ tag: string }>;
}

function decodeTag(raw: string): string {
  try {
    return decodeURIComponent(raw).trim();
  } catch {
    return raw.trim();
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { tag } = await params;
  const decoded = decodeTag(tag);
  return {
    title: `#${decoded} の記事`,
    description: `「${decoded}」タグが付いた記事の一覧。`,
  };
}

export default async function TagPage({ params }: PageProps) {
  const { tag } = await params;
  const decoded = decodeTag(tag);

  let articles: ArticleSummary[] = [];
  let failed = false;

  try {
    articles = await listArticles({ tag: decoded, limit: 50 });
  } catch (error) {
    console.error("[TagPage] listArticles failed:", error);
    failed = true;
  }

  return (
    <main className="mx-auto w-full max-w-[1100px] px-4 py-10 md:px-6">
      <nav className="mb-6 text-sm" aria-label="パンくず">
        <Link
          href="/tags"
          className="text-peco-gray-500 transition-colors hover:text-peco-primary-dark"
        >
          ← タグ一覧へ
        </Link>
      </nav>

      <h1 className="mb-2 text-3xl font-bold tracking-tight text-peco-gray-900">
        <span className="text-peco-primary">#</span>
        {decoded}
      </h1>
      <p className="mb-8 text-peco-gray-700">
        {failed
          ? "記事を読み込めませんでした。"
          : `${articles.length} 件の記事`}
      </p>

      {failed ? (
        <DbErrorState />
      ) : articles.length === 0 ? (
        <div className="rounded-peco-lg border border-peco-border bg-peco-surface">
          <PecoEmptyState
            title="該当する記事がありません"
            subtitle={`「${decoded}」タグの公開記事は見つかりませんでした。`}
            action={
              <Link
                href="/"
                className="inline-flex h-11 items-center rounded-peco-md bg-peco-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-peco-primary-dark"
              >
                記事一覧へ
              </Link>
            }
          />
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <li key={article.id} className="peco-fade-in">
              <ArticleCard article={article} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
