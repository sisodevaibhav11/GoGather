import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createTrip } from '../api.js';
import LocationAutocomplete from '../components/LocationAutocomplete.jsx';
import ProfileCompletionBanner from '../components/ProfileCompletionBanner.jsx';
import { useAuth } from '../hooks/useAuth.js';

function buildInitialLocation(name) {
  return { name: name || '', coordinates: null };
}

export default function CreateTripPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const initialForm = useMemo(() => ({
    arrivalLocation: buildInitialLocation(searchParams.get('arrival')),
    destination: buildInitialLocation(searchParams.get('destination')),
    travelDate: searchParams.get('date') || '',
    arrivalTime: searchParams.get('time') || '',
    matchingWindowMinutes: searchParams.get('window') || '45',
  }), [searchParams]);

  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      const { data } = await createTrip({
        ...form,
        matchingWindowMinutes: Number(form.matchingWindowMinutes),
      });
      toast.success('Trip created');
      navigate(`/trips/${data.trip.id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not create trip.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      {!user?.profileCompleted ? <ProfileCompletionBanner /> : null}

      <div className="surface-card p-6 sm:p-8">
        <p className="section-kicker">Create trip</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Tell GoGather when and where you are arriving</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Matching is based on arrival location, date, and how close the arrival times are.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
          <LocationAutocomplete
            label="Arrival location"
            value={form.arrivalLocation}
            onChange={(value) => setForm((current) => ({ ...current, arrivalLocation: value }))}
            placeholder="Ex: Coimbatore Junction"
            required
          />

          <LocationAutocomplete
            label="Destination"
            value={form.destination}
            onChange={(value) => setForm((current) => ({ ...current, destination: value }))}
            placeholder="Optional destination"
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="field-label">
              <span>Date *</span>
              <input
                type="date"
                value={form.travelDate}
                onChange={(event) => setForm((current) => ({ ...current, travelDate: event.target.value }))}
                className="field-input"
                required
              />
            </label>

            <label className="field-label">
              <span>Approximate arrival time *</span>
              <input
                type="time"
                value={form.arrivalTime}
                onChange={(event) => setForm((current) => ({ ...current, arrivalTime: event.target.value }))}
                className="field-input"
                required
              />
            </label>
          </div>

          <label className="field-label">
            <span>Matching window</span>
            <select
              value={form.matchingWindowMinutes}
              onChange={(event) => setForm((current) => ({ ...current, matchingWindowMinutes: event.target.value }))}
              className="field-input"
            >
              <option value="30">+/- 30 min</option>
              <option value="45">+/- 45 min</option>
              <option value="60">+/- 1 hour</option>
            </select>
          </label>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary"
          >
            {saving ? 'Creating trip...' : 'Create trip'}
          </button>
        </form>
      </div>
    </section>
  );
}
