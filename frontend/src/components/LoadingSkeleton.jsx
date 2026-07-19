export default function LoadingSkeleton({ lines = 3 }) {
  return (
    <div className="surface-card p-5">
      <div className="mb-4 h-5 w-1/3 animate-pulse rounded bg-[#333333]" />
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={`skeleton-${index}`}
            className="h-4 animate-pulse rounded bg-[#2a2a2a]"
            style={{ width: `${100 - (index * 12)}%` }}
          />
        ))}
      </div>
    </div>
  );
}
