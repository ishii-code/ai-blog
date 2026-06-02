import type { Metadata } from "next";
import { listTags } from "@/lib/db";
import { TagLink } from "@/components/TagLink";
import { PecoEmptyState } from "@/components/peco";
import { DbErrorState } from "@/components/DbErrorState";
import type { TagCount } from "@/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "タグ一覧",
  description: "記事に付与されたトピックタグの一覧。",
};

export default async function TagsPage() {
  let tags: TagCount[] = [];
  let failed = false;

  try {
    tags = await listTags();
  } catch (error) {
    console.error("[TagsPage] listTags failed:", error);
    failed = true;
  }

  return (
    <main className="mx-auto w-full max-w-[900px] px-4 py-10 md:px-6">
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-peco-gray-900">
        タグ一覧
      </h1>
      <p className="mb-8 text-peco-gray-700">
        トピックタグから記事を探せます。
      </p>

      {failed ? (
        <DbErrorState />
      ) : tags.length === 0 ? (
        <div className="rounded-peco-lg border border-peco-border bg-peco-surface">
          <PecoEmptyState
            title="タグがまだありません"
            subtitle="記事が公開されるとタグが表示されます。"
          />
        </div>
      ) : (
        <div className="flex flex-wrap gap-2.5">
          {tags.map((t) => (
            <TagLink key={t.tag} tag={t.tag} count={t.count} />
          ))}
        </div>
      )}
    </main>
  );
}
