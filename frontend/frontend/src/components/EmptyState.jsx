export default function EmptyState({ title, body, action }) {
  return (
    <div className="rounded-3xl border border-dashed border-stone-700 bg-stone-900/70 p-6 text-center">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-stone-400">{body}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
