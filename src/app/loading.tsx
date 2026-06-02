import { PecoSpinner } from "@/components/peco";

export default function Loading() {
  return (
    <div
      className="flex min-h-[50vh] flex-col items-center justify-center gap-3"
      role="status"
      aria-live="polite"
    >
      <PecoSpinner size="lg" />
      <p className="text-sm text-peco-gray-500">読み込み中…</p>
    </div>
  );
}
