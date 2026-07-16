import { useState } from 'react';
import toast from 'react-hot-toast';
import { requestConnection, submitReport, createGroup, joinGroup } from '../api.js';

export default function MatchCard({ match, ownTripId, onUpdated }) {
  const [connecting, setConnecting] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportOpen, setReportOpen] = useState(false);
  const [joining, setJoining] = useState(false);

  async function handleConnect() {
    try {
      setConnecting(true);
      const { data } = await requestConnection({
        ownTripId,
        targetTripId: match.tripId,
      });
      toast.success(data.message);
      onUpdated();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not send connection request.');
    } finally {
      setConnecting(false);
    }
  }

  async function handleReport() {
    try {
      setReporting(true);
      await submitReport({
        tripId: match.tripId,
        reportedUserId: match.user.id,
        reason: reportReason,
      });
      toast.success('Report submitted');
      setReportReason('');
      setReportOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not submit report.');
    } finally {
      setReporting(false);
    }
  }

  async function handleJoinGroup() {
    if (!match.group) return;
    try {
      setJoining(true);
      // ensure user has a group for their own trip (create if missing) then request to join
      await createGroup({ tripId: ownTripId }).catch(() => {});
      await joinGroup(match.group.id, {});
      toast.success('Requested to join group');
      onUpdated();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not join group.');
    } finally {
      setJoining(false);
    }
  }

  return (
    <article className="rounded-3xl border border-stone-800 bg-stone-900/80 p-5">
      <div className="flex items-start gap-4">
        <img
          src={match.user.photoUrl || 'https://placehold.co/96x96?text=TB'}
          alt={match.user.name}
          className="h-14 w-14 rounded-2xl object-cover"
        />
        <div className="flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-white">{match.user.name}</h3>
              <p className="text-sm text-stone-400">{match.timeDifferenceLabel}</p>
            </div>
            <span className="rounded-full bg-stone-800 px-3 py-1 text-xs uppercase tracking-[0.18em] text-stone-300">
              {match.arrivalTime}
            </span>
          </div>

          {match.matchReasons && match.matchReasons.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {match.matchReasons.map((reason) => (
                <span key={reason} className="rounded-full bg-stone-800 px-2 py-1 text-xs text-stone-300">{reason}</span>
              ))}
            </div>
          ) : null}

          <div className="mt-4 grid gap-2 text-sm text-stone-300">
            <p><span className="text-stone-500">Arrival:</span> {match.arrivalLocation?.name}</p>
            <p><span className="text-stone-500">Destination:</span> {match.destination?.name || 'Not shared'}</p>
            <p>
              <span className="text-stone-500">Contact:</span>
              {' '}
              {match.connection.contactUnlocked ? match.user.mobileNumber : 'Hidden until both sides connect'}
            </p>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {match.group ? (
              <>
                <button
                  type="button"
                  onClick={handleJoinGroup}
                  disabled={joining}
                  className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-stone-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {joining ? 'Requesting...' : match.group.isMember ? 'Member' : 'Join Group'}
                </button>
                <button
                  type="button"
                  onClick={() => setReportOpen((current) => !current)}
                  className="rounded-full border border-stone-700 px-4 py-2 text-sm text-stone-200 transition hover:border-rose-400 hover:text-white"
                >
                  Report user
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleConnect}
                  disabled={connecting || match.connection.contactUnlocked}
                  className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-stone-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {match.connection.contactUnlocked
                    ? 'Connected'
                    : match.connection.requestedByMe
                      ? 'Request Sent'
                      : connecting
                        ? 'Connecting...'
                        : 'Connect'}
                </button>
                <button
                  type="button"
                  onClick={() => setReportOpen((current) => !current)}
                  className="rounded-full border border-stone-700 px-4 py-2 text-sm text-stone-200 transition hover:border-rose-400 hover:text-white"
                >
                  Report user
                </button>
              </>
            )}
          </div>

          {reportOpen ? (
            <div className="mt-4 rounded-2xl border border-stone-800 bg-stone-950/80 p-4">
              <textarea
                value={reportReason}
                onChange={(event) => setReportReason(event.target.value)}
                rows={3}
                placeholder="Briefly describe the issue"
                className="w-full rounded-2xl border border-stone-700 bg-stone-900 px-4 py-3 text-sm text-white outline-none focus:border-rose-400"
              />
              <button
                type="button"
                onClick={handleReport}
                disabled={reporting || reportReason.trim().length < 5}
                className="mt-3 rounded-full bg-rose-400 px-4 py-2 text-sm font-semibold text-stone-950 transition hover:bg-rose-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {reporting ? 'Submitting...' : 'Submit report'}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
