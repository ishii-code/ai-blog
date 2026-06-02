import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-[640px] flex-col items-center px-4 py-24 text-center md:px-6">
      <p className="text-6xl font-bold text-peco-primary">404</p>
      <h1 className="mt-4 text-2xl font-bold text-peco-gray-900">
        ページが見つかりません
      </h1>
      <p className="mt-3 text-peco-gray-700">
        お探しの記事は存在しないか、非公開になっている可能性があります。
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-12 items-center rounded-peco-md bg-peco-primary px-6 font-semibold text-white transition-colors hover:bg-peco-primary-dark"
      >
        記事一覧へ戻る
      </Link>
    </main>
  );
}
