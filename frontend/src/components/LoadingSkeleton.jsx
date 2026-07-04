export default function LoadingSkeleton({ lines = 3 }) {
  return (
    <div className="rounded-3xl border border-stone-800 bg-stone-900/70 p-5">
      <div className="mb-4 h-5 w-1/3 animate-pulse rounded bg-stone-700" />
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={`skeleton-${index}`}
            className="h-4 animate-pulse rounded bg-stone-800"
            style={{ width: `${100 - (index * 12)}%` }}
          />
        ))}
      </div>
    </div>
  );
}
