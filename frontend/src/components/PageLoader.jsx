export default function PageLoader({ label = 'Loading...' }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="surface-card px-6 py-5 text-center">
        <div className="mx-auto mb-3 h-10 w-10 animate-pulse rounded-full bg-teal-200" />
        <p className="text-sm text-slate-600">{label}</p>
      </div>
    </div>
  );
}
