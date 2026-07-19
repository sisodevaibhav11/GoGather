import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import {
  fetchTripDetails,
  fetchTripMatches,
  updateTripStatus as updateTripStatusRequest,
  updateTrip as updateTripRequest,
  deleteTrip as deleteTripRequest,
} from '../api.js';
import AITravelAssistant from '../components/AITravelAssistant.jsx';
import EmptyState from '../components/EmptyState.jsx';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';
import MatchCard from '../components/MatchCard.jsx';
// maps removed - text-only UI
import LocationAutocomplete from '../components/LocationAutocomplete.jsx';
import { buildShareUrl, formatStatus } from '../utils/formatters.js';

export default function TripDetailsPage() {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [matches, setMatches] = useState([]);
  const [emptyState, setEmptyState] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusSaving, setStatusSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const shareUrl = useMemo(() => (trip ? buildShareUrl(trip.shareCode) : ''), [trip]);

  useEffect(() => {
    let isMounted = true;
    const prevContactUnlockedRef = { current: new Map() };

    async function bootstrap() {
      try {
        const [tripResponse, matchesResponse] = await Promise.all([
          fetchTripDetails(tripId),
          fetchTripMatches(tripId),
        ]);

        if (!isMounted) {
          return;
        }

        setTrip(tripResponse.data.trip);
        const initialMatches = matchesResponse.data.matches || [];
        setMatches(initialMatches);
        setEmptyState(matchesResponse.data.emptyState || '');

        // initialize prev map so we don't re-toast existing mutual connections
        initialMatches.forEach((m) => {
          prevContactUnlockedRef.current.set(m.tripId, !!m.connection.contactUnlocked);
        });
      } catch (error) {
        if (isMounted) {
          toast.error(error.response?.data?.message || 'Could not load this trip.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    bootstrap();

    const pollInterval = 7000;
    const intervalId = setInterval(async () => {
      try {
        const matchesResponse = await fetchTripMatches(tripId);
        const newMatches = matchesResponse.data.matches || [];

        // detect newly mutual connections using persistent previous state
        newMatches.forEach((m) => {
          const prev = prevContactUnlockedRef.current.get(m.tripId);
          const now = !!m.connection.contactUnlocked;
          if (!prev && now) {
            toast.success('Connection confirmed. Phone number revealed for a match.');
          }
          prevContactUnlockedRef.current.set(m.tripId, now);
        });

        setMatches(newMatches);

        const tripResponse = await fetchTripDetails(tripId);
        setTrip(tripResponse.data.trip);
      } catch {
        // silent
      }
    }, pollInterval);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [tripId]);

  async function loadTripData() {
    try {
      setLoading(true);
      const [tripResponse, matchesResponse] = await Promise.all([
        fetchTripDetails(tripId),
        fetchTripMatches(tripId),
      ]);
      setTrip(tripResponse.data.trip);
      setMatches(matchesResponse.data.matches || []);
      setEmptyState(matchesResponse.data.emptyState || '');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not load this trip.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Trip link copied');
    } catch {
      toast.error('Could not copy the link.');
    }
  }

  async function handleStatusChange(event) {
    try {
      setStatusSaving(true);
      const { data } = await updateTripStatusRequest(tripId, event.target.value);
      setTrip(data.trip);
      toast.success('Trip status updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not update trip status.');
    } finally {
      setStatusSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="grid gap-4">
        <LoadingSkeleton lines={5} />
        <LoadingSkeleton lines={5} />
      </div>
    );
  }

  if (!trip) {
    return null;
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="flex flex-col gap-6">
        <div className="surface-card p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="section-kicker">Trip details</p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-900">{trip.arrivalLocation.name}</h1>
            </div>
            <span className="badge-pill">
              {formatStatus(trip.status)}
            </span>
          </div>

          <div className="mt-6 grid gap-3 text-sm text-slate-600">
            <p><span className="text-slate-400">Date:</span> {trip.travelDate}</p>
            <p><span className="text-slate-400">Arrival time:</span> {trip.arrivalTime}</p>
            <p><span className="text-slate-400">Destination:</span> {trip.destination?.name || 'Optional / not provided'}</p>
            <p><span className="text-slate-400">Matching window:</span> +/- {trip.matchingWindowMinutes} min</p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleCopyLink}
              className="btn-primary"
            >
              Copy trip link
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing((e) => !e);
                setEditForm(trip);
              }}
              className="btn-secondary"
            >
              {editing ? 'Cancel' : 'Edit'}
            </button>
            <button
              type="button"
              onClick={async () => {
                if (!window.confirm('Delete this trip? This cannot be undone.')) return;
                try {
                  await deleteTripRequest(tripId);
                  toast.success('Trip deleted');
                  window.location.href = '/trips';
                } catch (error) {
                  toast.error(error.response?.data?.message || 'Could not delete trip.');
                }
              }}
              className="btn-danger"
            >
              Delete
            </button>
            <p className="truncate text-sm text-slate-500">{shareUrl}</p>
          </div>

          {editing && editForm ? (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  setSavingEdit(true);
                  const payload = {
                    arrivalLocation: editForm.arrivalLocation,
                    destination: editForm.destination,
                    travelDate: editForm.travelDate,
                    arrivalTime: editForm.arrivalTime,
                    matchingWindowMinutes: Number(editForm.matchingWindowMinutes),
                  };
                  const { data } = await updateTripRequest(tripId, payload);
                  setTrip(data.trip);
                  setEditing(false);
                  toast.success('Trip updated');
                } catch (error) {
                  toast.error(error.response?.data?.message || 'Could not update trip.');
                } finally {
                  setSavingEdit(false);
                }
              }}
              className="mt-6 grid gap-5"
            >
              <LocationAutocomplete
                label="Arrival location"
                value={editForm.arrivalLocation}
                onChange={(value) => setEditForm((c) => ({ ...c, arrivalLocation: value }))}
                placeholder="Ex: Coimbatore Junction"
                required
              />

              <LocationAutocomplete
                label="Destination"
                value={editForm.destination}
                onChange={(value) => setEditForm((c) => ({ ...c, destination: value }))}
                placeholder="Optional destination"
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="field-label">
                  <span>Date *</span>
                  <input
                    type="date"
                    value={editForm.travelDate}
                    onChange={(event) => setEditForm((c) => ({ ...c, travelDate: event.target.value }))}
                    className="field-input"
                    required
                  />
                </label>

                <label className="field-label">
                  <span>Approximate arrival time *</span>
                  <input
                    type="time"
                    value={editForm.arrivalTime}
                    onChange={(event) => setEditForm((c) => ({ ...c, arrivalTime: event.target.value }))}
                    className="field-input"
                    required
                  />
                </label>
              </div>

              <label className="field-label">
                <span>Matching window</span>
                <select
                  value={editForm.matchingWindowMinutes}
                  onChange={(event) => setEditForm((c) => ({ ...c, matchingWindowMinutes: event.target.value }))}
                  className="field-input"
                >
                  <option value="30">+/- 30 min</option>
                  <option value="45">+/- 45 min</option>
                  <option value="60">+/- 1 hour</option>
                </select>
              </label>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="btn-primary"
                >
                  {savingEdit ? 'Saving...' : 'Save changes'}
                </button>
                <button
                  type="button"
                  onClick={() => { setEditing(false); setEditForm(null); }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : null}

          <label className="field-label mt-6">
            <span>Trip status</span>
            <select
              value={trip.status}
              onChange={handleStatusChange}
              disabled={statusSaving}
              className="field-input"
            >
              <option value="waiting">Waiting</option>
              <option value="matched">Matched</option>
              <option value="done">Trip Done</option>
            </select>
          </label>
        </div>

        <div className="surface-card p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-slate-900">Trip locations</h2>
          <p className="mt-2 text-sm text-slate-500">Arrival: {trip.arrivalLocation?.name}</p>
          <p className="mt-1 text-sm text-slate-500">Destination: {trip.destination?.name || 'Not provided'}</p>
        </div>

        <AITravelAssistant tripId={tripId} />
      </div>

      <div className="flex flex-col gap-4">
        <div className="surface-card p-6">
          <h2 className="text-2xl font-semibold text-slate-900">Automatic matches</h2>
          <p className="mt-2 text-sm text-slate-500">
            Sorted by closest arrival time first. Phone numbers remain private until both travelers tap Connect.
          </p>
        </div>

        {matches.length === 0 ? (
          <EmptyState
            title="No matches yet"
            body={emptyState || 'Share your trip link so more travelers can find you.'}
            action={(
              <button
                type="button"
                onClick={handleCopyLink}
                className="btn-primary"
              >
                Copy trip link
              </button>
            )}
          />
        ) : (
          matches.map((match) => (
            <MatchCard
              key={match.tripId}
              match={match}
              ownTripId={tripId}
              onUpdated={loadTripData}
            />
          ))
        )}
      </div>
    </section>
  );
}
