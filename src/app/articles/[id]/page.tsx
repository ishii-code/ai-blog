import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getArticle } from "@/lib/db";
import { Markdown } from "@/components/Markdown";
import { TagLink } from "@/components/TagLink";
import { formatDate, toDateTimeAttr, structureLabel } from "@/lib/format";

export const dynamic = "force-dynamic";

interface PageProps {
  // Next.js 16 では params は Promise。
  params: Promise<{ id: string }>;
}

/** "3" のような文字列を正の整数へ。不正なら null。 */
function parseId(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null;
  const n = Number.parseInt(raw, 10);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (id === null) return { title: "記事が見つかりません" };

  try {
    const article = await getArticle(id);
    if (!article) return { title: "記事が見つかりません" };
    return {
      title: article.title,
      description: article.topicTags.join("・") || undefined,
    };
  } catch {
    return { title: "記事" };
  }
}

export default async function ArticlePage({ params }: PageProps) {
  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (id === null) notFound();

  const article = await getArticle(id);
  if (!article) notFound();

  const struct = structureLabel(article.structureType);
  const hasSource = !!article.sourceUrl || !!article.sourceTitle;

  return (
    <main className="mx-auto w-full max-w-[760px] px-4 py-10 md:px-6">
      <nav className="mb-6 text-sm" aria-label="パンくず">
        <Link
          href="/"
          className="text-peco-gray-500 transition-colors hover:text-peco-primary-dark"
        >
          ← 記事一覧へ戻る
        </Link>
      </nav>

      <article>
        <header className="mb-8 border-b border-peco-border pb-6">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-peco-gray-900 md:text-4xl">
            {article.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-peco-gray-500">
            <time dateTime={toDateTimeAttr(article.createdAt)}>
              公開日 {formatDate(article.createdAt)}
            </time>
            {struct ? (
              <>
                <span aria-hidden>·</span>
                <span className="rounded-peco-sm bg-peco-primary-subtle px-2 py-0.5 font-medium text-peco-primary-dark">
                  {struct}
                </span>
              </>
            ) : null}
          </div>

          {article.topicTags.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {article.topicTags.map((tag) => (
                <TagLink key={tag} tag={tag} />
              ))}
            </div>
          ) : null}
        </header>

        <Markdown content={article.content} />

        {hasSource ? (
          <footer className="mt-12 border-t border-peco-border pt-6">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-peco-gray-500">
              出典
            </h2>
            <ol className="space-y-2 text-sm">
              <li className="flex gap-2">
                <span aria-hidden className="text-peco-gray-500">
                  [1]
                </span>
                {article.sourceUrl ? (
                  <a
                    href={article.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-peco-secondary underline underline-offset-2 hover:text-peco-secondary-dark"
                  >
                    {article.sourceTitle || article.sourceUrl}
                  </a>
                ) : (
                  <span className="text-peco-gray-700">
                    {article.sourceTitle}
                  </span>
                )}
              </li>
            </ol>
          </footer>
        ) : null}
      </article>
    </main>
  );
}
