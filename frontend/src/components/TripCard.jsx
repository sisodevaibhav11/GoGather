import { Link } from 'react-router-dom';
import { formatStatus } from '../utils/formatters.js';

export default function TripCard({ trip }) {
  return (
    <Link
      to={`/trips/${trip.id}`}
      className="block rounded-3xl border border-stone-800 bg-stone-900/80 p-5 transition hover:border-amber-400/50"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-stone-500">Arrival</p>
          <h3 className="mt-2 text-lg font-semibold text-white">{trip.arrivalLocation.name}</h3>
          <p className="mt-3 text-sm text-stone-400">
            {trip.travelDate} at {trip.arrivalTime}
          </p>
          <p className="mt-2 text-sm text-stone-500">
            Match window: +/- {trip.matchingWindowMinutes} min
          </p>
        </div>
        <span className="rounded-full bg-stone-800 px-3 py-1 text-xs uppercase tracking-[0.18em] text-stone-300">
          {formatStatus(trip.status)}
        </span>
      </div>
    </Link>
  );
}
