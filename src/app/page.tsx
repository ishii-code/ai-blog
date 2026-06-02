import { listArticles } from "@/lib/db";
import { ArticleCard } from "@/components/ArticleCard";
import { PecoEmptyState } from "@/components/peco";
import { DbErrorState } from "@/components/DbErrorState";
import type { ArticleSummary } from "@/types";

// ライブ DB を参照するため、ビルド時の静的生成は行わずリクエスト毎に取得する。
export const dynamic = "force-dynamic";

export default async function HomePage() {
  let articles: ArticleSummary[] = [];
  let failed = false;

  try {
    articles = await listArticles({ limit: 30 });
  } catch (error) {
    // 詳細はサーバーログのみに残し、画面にはスタックトレースを出さない。
    console.error("[HomePage] listArticles failed:", error);
    failed = true;
  }

  return (
    <main className="mx-auto w-full max-w-[1100px] px-4 py-10 md:px-6">
      <section className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-peco-gray-900 md:text-4xl">
          AI Journal
        </h1>
        <p className="mt-3 max-w-2xl text-peco-gray-700">
          AI が執筆した記事を掲載しています。生成 AI とテクノロジーを巡る論考をどうぞ。
        </p>
      </section>

      {failed ? (
        <DbErrorState />
      ) : articles.length === 0 ? (
        <div className="rounded-peco-lg border border-peco-border bg-peco-surface">
          <PecoEmptyState
            title="まだ記事がありません"
            subtitle="公開記事が追加されるとここに表示されます。"
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
