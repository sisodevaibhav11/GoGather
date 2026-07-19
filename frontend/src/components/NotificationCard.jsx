export default function NotificationCard({ notification, onConnectBack, busy }) {
  return (
    <div className="rounded-2xl border border-[#00d084] bg-[#163628] p-4">
      <p className="text-sm text-[#d7ffed]">
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
        className="mt-3 rounded-xl bg-[#00d084] px-4 py-2 text-sm font-semibold text-[#0f0f0f] transition hover:bg-[#00b974] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? 'Connecting...' : 'Connect Back'}
      </button>
    </div>
  );
}
