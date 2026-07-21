import { useNavigate } from 'react-router-dom';
import { HiMapPin } from 'react-icons/hi2';
import { formatStatus } from '../utils/formatters.js';

const transportLabels = {
  airport: 'Airport',
  railway: 'Railway',
  'bus-stand': 'Bus Stand',
};

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

  const transportLabel = transportLabels[trip.transportType] || 'Ride';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/trips/${trip.id}`)}
      className="surface-card block p-4 transition hover:border-[#00d084]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge-pill">{transportLabel}</span>
            <span className="rounded-full bg-[#2a2a2a] px-3 py-1 text-[11px] font-semibold text-[#888888]">
              {formatStatus(trip.status)}
            </span>
          </div>

          <div className="mt-4 flex items-start gap-3">
            <HiMapPin className="mt-0.5 shrink-0 text-[18px] text-[#00d084]" />
            <div>
              <p className="text-xs text-[#888888]">From</p>
              <p className="text-sm font-semibold text-white">{trip.arrivalLocation.name}</p>
            </div>
          </div>

          <div className="mt-3 flex items-start gap-3">
            <HiMapPin className="mt-0.5 shrink-0 text-[18px] text-[#ff4444]" />
            <div>
              <p className="text-xs text-[#888888]">To</p>
              <p className="text-sm font-semibold text-white">{trip.destination?.name || 'Destination not added'}</p>
            </div>
          </div>

          <p className="mt-4 text-xs text-[#888888]">
            {trip.travelDate} at {trip.arrivalTime} • Match window +/- {trip.matchingWindowMinutes} min
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <button
            type="button"
            onClick={handleEditClick}
            className="rounded-xl border border-[#333333] px-3 py-1.5 text-xs text-[#888888] hover:border-[#00d084] hover:text-white"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={handleDeleteClick}
            className="rounded-xl bg-[#2a1616] px-3 py-1.5 text-xs text-[#ff7474] hover:bg-[#341818]"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
