import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useParams } from 'react-router-dom';
import { fetchSharedTrip } from '../api.js';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';
import TripLocationsMap from '../components/TripLocationsMap.jsx';
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

    document.title = `${trip.arrivalLocation.name} at ${trip.arrivalTime} | TravelBuddy`;
    setMetaTag('property', 'og:title', `${trip.arrivalLocation.name} | TravelBuddy`);
    setMetaTag('property', 'og:description', `Arriving on ${trip.travelDate} at ${trip.arrivalTime}. Create your own matching trip on TravelBuddy.`);
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
      <div className="rounded-[2rem] border border-stone-800 bg-stone-900/85 p-6 sm:p-8">
        <p className="text-sm uppercase tracking-[0.28em] text-stone-500">Shared trip</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">{trip.arrivalLocation.name}</h1>
        <p className="mt-3 text-sm leading-7 text-stone-300">
          Someone shared this trip so others reaching around the same time can create a matching trip and connect safely.
        </p>

        <div className="mt-6 grid gap-3 rounded-3xl bg-stone-950/70 p-5 text-sm text-stone-300">
          <p><span className="text-stone-500">Date:</span> {trip.travelDate}</p>
          <p><span className="text-stone-500">Arrival time:</span> {trip.arrivalTime}</p>
          <p><span className="text-stone-500">Destination:</span> {trip.destination?.name || 'Optional / not provided'}</p>
          <p><span className="text-stone-500">Match window:</span> +/- {trip.matchingWindowMinutes} min</p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {isAuthenticated ? (
            <Link
              to={createTripLink}
              className="rounded-full bg-amber-400 px-5 py-3 font-semibold text-stone-950 transition hover:bg-amber-300"
            >
              Create my matching trip
            </Link>
          ) : (
            <Link
              to="/login"
              className="rounded-full bg-amber-400 px-5 py-3 font-semibold text-stone-950 transition hover:bg-amber-300"
            >
              Login to create a matching trip
            </Link>
          )}
        </div>
      </div>

      <TripLocationsMap
        title="Trip map"
        arrivalLocation={trip.arrivalLocation}
        destination={trip.destination}
        emptyMessage="This shared trip does not have saved coordinates yet."
      />
    </section>
  );
}
