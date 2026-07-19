import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useParams } from 'react-router-dom';
import { fetchSharedTrip } from '../api.js';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';
// maps removed - text-only display
import { useAuth } from '../hooks/useAuth.js';
import { setMetaTag } from '../utils/meta.js';

export default function ShareTripPage() {
  const { shareCode } = useParams();
  const { isAuthenticated } = useAuth();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrip() {
      try {
        setLoading(true);
        const { data } = await fetchSharedTrip(shareCode);
        setTrip(data.trip);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Could not open this trip link.');
      } finally {
        setLoading(false);
      }
    }

    loadTrip();
  }, [shareCode]);

  useEffect(() => {
    if (!trip) {
      return;
    }

    document.title = `${trip.arrivalLocation.name} at ${trip.arrivalTime} | GoGather`;
    setMetaTag('property', 'og:title', `${trip.arrivalLocation.name} | GoGather`);
    setMetaTag('property', 'og:description', `Arriving on ${trip.travelDate} at ${trip.arrivalTime}. Create your own matching trip on GoGather.`);
  }, [trip]);

  const createTripLink = useMemo(() => {
    if (!trip) {
      return '/create-trip';
    }

    const params = new URLSearchParams({
      arrival: trip.arrivalLocation?.name || '',
      destination: trip.destination?.name || '',
      date: trip.travelDate || '',
      time: trip.arrivalTime || '',
      window: String(trip.matchingWindowMinutes || 45),
    });

    return `/create-trip?${params.toString()}`;
  }, [trip]);

  if (loading) {
    return <LoadingSkeleton lines={5} />;
  }

  if (!trip) {
    return null;
  }

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="surface-card p-6 sm:p-8">
        <p className="section-kicker">Shared trip</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">{trip.arrivalLocation.name}</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Someone shared this trip so others reaching around the same time can create a matching trip and connect safely.
        </p>

        <div className="surface-soft mt-6 grid gap-3 p-5 text-sm text-slate-600">
          <p><span className="text-slate-400">Date:</span> {trip.travelDate}</p>
          <p><span className="text-slate-400">Arrival time:</span> {trip.arrivalTime}</p>
          <p><span className="text-slate-400">Destination:</span> {trip.destination?.name || 'Optional / not provided'}</p>
          <p><span className="text-slate-400">Match window:</span> +/- {trip.matchingWindowMinutes} min</p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {isAuthenticated ? (
            <Link
              to={createTripLink}
              className="btn-primary"
            >
              Create my matching trip
            </Link>
          ) : (
            <Link
              to="/login"
              className="btn-primary"
            >
              Login to create a matching trip
            </Link>
          )}
        </div>
      </div>

      <div className="surface-card p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-slate-900">Trip locations</h2>
        <p className="mt-2 text-sm text-slate-500">Arrival: {trip.arrivalLocation?.name}</p>
        <p className="mt-1 text-sm text-slate-500">Destination: {trip.destination?.name || 'Not provided'}</p>
      </div>
    </section>
  );
}
