export default function EmptyState({ title, body, action }) {
  return (
    <div className="surface-card border-dashed p-6 text-center">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-500">{body}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
