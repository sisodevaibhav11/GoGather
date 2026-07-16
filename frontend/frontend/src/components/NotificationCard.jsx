export default function NotificationCard({ notification, onConnectBack, busy }) {
  return (
    <div className="rounded-3xl border border-emerald-400/30 bg-emerald-400/10 p-4">
      <p className="text-sm text-emerald-100">
        <span className="font-semibold">{notification.requester.name}</span>
        {' '}
        wants to connect with you for
        {' '}
        <span className="font-semibold">{notification.tripLabel}</span>.
      </p>
      <button
        type="button"
        onClick={() => onConnectBack(notification)}
        disabled={busy}
        className="mt-3 rounded-full bg-emerald-300 px-4 py-2 text-sm font-semibold text-stone-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? 'Connecting...' : 'Connect Back'}
      </button>
    </div>
  );
}
