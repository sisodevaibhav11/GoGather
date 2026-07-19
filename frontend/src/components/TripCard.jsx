import { useNavigate } from 'react-router-dom';
import { formatStatus } from '../utils/formatters.js';

export default function TripCard({ trip, onDelete }) {
  const navigate = useNavigate();

  async function handleDeleteClick(event) {
    event.stopPropagation();
    if (!onDelete) return;
    if (!window.confirm('Delete this trip? This cannot be undone.')) return;
    await onDelete(trip.id);
  }

  function handleEditClick(event) {
    event.stopPropagation();
    navigate(`/trips/${trip.id}`);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/trips/${trip.id}`)}
      className="surface-card block p-5 transition hover:-translate-y-0.5 hover:border-teal-300"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="section-kicker">Arrival</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">{trip.arrivalLocation.name}</h3>
          <p className="mt-3 text-sm text-slate-600">
            {trip.travelDate} at {trip.arrivalTime}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Match window: +/- {trip.matchingWindowMinutes} min
          </p>
        </div>
        <div className="flex items-start gap-3">
          <span className="badge-pill">
            {formatStatus(trip.status)}
          </span>
          <button
            type="button"
            onClick={handleEditClick}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700 hover:border-teal-700 hover:text-teal-700"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={handleDeleteClick}
            className="rounded-full bg-red-700 px-3 py-1 text-xs text-white hover:bg-red-800"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
