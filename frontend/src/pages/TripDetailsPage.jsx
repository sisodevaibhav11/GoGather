import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import {
  fetchTripDetails,
  fetchTripMatches,
  updateTripStatus as updateTripStatusRequest,
} from '../api.js';
import AITravelAssistant from '../components/AITravelAssistant.jsx';
import EmptyState from '../components/EmptyState.jsx';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';
import MatchCard from '../components/MatchCard.jsx';
import TripLocationsMap from '../components/TripLocationsMap.jsx';
import { buildShareUrl, formatStatus } from '../utils/formatters.js';

export default function TripDetailsPage() {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [matches, setMatches] = useState([]);
  const [emptyState, setEmptyState] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusSaving, setStatusSaving] = useState(false);
  const shareUrl = useMemo(() => (trip ? buildShareUrl(trip.shareCode) : ''), [trip]);

  useEffect(() => {
    let isMounted = true;

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
        setMatches(matchesResponse.data.matches || []);
        setEmptyState(matchesResponse.data.emptyState || '');
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

    return () => {
      isMounted = false;
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
        <div className="rounded-[2rem] border border-stone-800 bg-stone-900/85 p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-stone-500">Trip details</p>
              <h1 className="mt-3 text-3xl font-semibold text-white">{trip.arrivalLocation.name}</h1>
            </div>
            <span className="rounded-full bg-stone-800 px-3 py-1 text-xs uppercase tracking-[0.18em] text-stone-300">
              {formatStatus(trip.status)}
            </span>
          </div>

          <div className="mt-6 grid gap-3 text-sm text-stone-300">
            <p><span className="text-stone-500">Date:</span> {trip.travelDate}</p>
            <p><span className="text-stone-500">Arrival time:</span> {trip.arrivalTime}</p>
            <p><span className="text-stone-500">Destination:</span> {trip.destination?.name || 'Optional / not provided'}</p>
            <p><span className="text-stone-500">Matching window:</span> +/- {trip.matchingWindowMinutes} min</p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleCopyLink}
              className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-stone-950 transition hover:bg-amber-300"
            >
              Copy trip link
            </button>
            <p className="truncate text-sm text-stone-500">{shareUrl}</p>
          </div>

          <label className="mt-6 flex flex-col gap-2 text-sm text-stone-300">
            <span className="font-medium text-stone-200">Trip status</span>
            <select
              value={trip.status}
              onChange={handleStatusChange}
              disabled={statusSaving}
              className="rounded-2xl border border-stone-700 bg-stone-950 px-4 py-3 text-white outline-none transition focus:border-amber-400"
            >
              <option value="waiting">Waiting</option>
              <option value="matched">Matched</option>
              <option value="done">Trip Done</option>
            </select>
          </label>
        </div>

        <TripLocationsMap
          title="Trip map"
          arrivalLocation={trip.arrivalLocation}
          destination={trip.destination}
          emptyMessage="Add map pins while creating a trip to show the arrival and destination on the map."
        />

        <AITravelAssistant tripId={tripId} />
      </div>

      <div className="flex flex-col gap-4">
        <div className="rounded-[2rem] border border-stone-800 bg-stone-900/85 p-6">
          <h2 className="text-2xl font-semibold text-white">Automatic matches</h2>
          <p className="mt-2 text-sm text-stone-400">
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
                className="rounded-full bg-amber-400 px-4 py-2 font-semibold text-stone-950"
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
