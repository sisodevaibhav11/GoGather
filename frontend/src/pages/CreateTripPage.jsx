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

      <div className="rounded-[2rem] border border-stone-800 bg-stone-900/85 p-6 sm:p-8">
        <p className="text-sm uppercase tracking-[0.28em] text-stone-500">Create trip</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Tell TravelBuddy when and where you are arriving</h1>
        <p className="mt-3 text-sm leading-7 text-stone-300">
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
            <label className="flex flex-col gap-2 text-sm text-stone-300">
              <span className="font-medium text-stone-200">Date *</span>
              <input
                type="date"
                value={form.travelDate}
                onChange={(event) => setForm((current) => ({ ...current, travelDate: event.target.value }))}
                className="rounded-2xl border border-stone-700 bg-stone-950 px-4 py-3 text-white outline-none transition focus:border-amber-400"
                required
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-stone-300">
              <span className="font-medium text-stone-200">Approximate arrival time *</span>
              <input
                type="time"
                value={form.arrivalTime}
                onChange={(event) => setForm((current) => ({ ...current, arrivalTime: event.target.value }))}
                className="rounded-2xl border border-stone-700 bg-stone-950 px-4 py-3 text-white outline-none transition focus:border-amber-400"
                required
              />
            </label>
          </div>

          <label className="flex flex-col gap-2 text-sm text-stone-300">
            <span className="font-medium text-stone-200">Matching window</span>
            <select
              value={form.matchingWindowMinutes}
              onChange={(event) => setForm((current) => ({ ...current, matchingWindowMinutes: event.target.value }))}
              className="rounded-2xl border border-stone-700 bg-stone-950 px-4 py-3 text-white outline-none transition focus:border-amber-400"
            >
              <option value="30">+/- 30 min</option>
              <option value="45">+/- 45 min</option>
              <option value="60">+/- 1 hour</option>
            </select>
          </label>

          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-amber-400 px-5 py-3 font-semibold text-stone-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Creating trip...' : 'Create trip'}
          </button>
        </form>
      </div>
    </section>
  );
}
