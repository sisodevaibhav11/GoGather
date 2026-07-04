export default function PageLoader({ label = 'Loading...' }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="rounded-3xl border border-stone-800 bg-stone-900/80 px-6 py-5 text-center shadow-2xl shadow-black/30">
        <div className="mx-auto mb-3 h-10 w-10 animate-pulse rounded-full bg-amber-400/70" />
        <p className="text-sm text-stone-300">{label}</p>
      </div>
    </div>
  );
}
