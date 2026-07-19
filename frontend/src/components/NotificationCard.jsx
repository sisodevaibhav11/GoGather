export default function NotificationCard({ notification, onConnectBack, busy }) {
  return (
    <div className="surface-card border-emerald-200 bg-emerald-50 p-4">
      <p className="text-sm text-emerald-900">
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
        className="mt-3 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? 'Connecting...' : 'Connect Back'}
      </button>
    </div>
  );
}
