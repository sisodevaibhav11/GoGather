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
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      {!user?.profileCompleted ? <ProfileCompletionBanner /> : null}

      <div className="surface-card p-6 sm:p-8">
        <p className="section-kicker">Post a ride</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Post a ride</h1>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-5 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-semibold text-white">Transport type</p>
            <div className="grid grid-cols-3 gap-3">
              {['Airport', 'Railway', 'Bus Stand'].map((item, index) => (
                <button
                  key={item}
                  type="button"
                  className={`rounded-xl border px-3 py-3 text-sm font-semibold ${
                    index === 1
                      ? 'border-white bg-white text-black'
                      : 'border-[#333333] bg-[#2a2a2a] text-[#888888]'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

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

          <div>
            <p className="mb-3 text-sm font-semibold text-white">Direction</p>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" className="rounded-xl border border-white bg-white px-3 py-3 text-sm font-semibold text-black">
                Leaving campus
              </button>
              <button type="button" className="rounded-xl border border-[#333333] bg-[#2a2a2a] px-3 py-3 text-sm font-semibold text-[#888888]">
                Coming to campus
              </button>
            </div>
          </div>

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

          <div>
            <p className="mb-3 text-sm font-semibold text-white">How many partners do you need?</p>
            <div className="flex gap-3">
              {[1, 2, 3, 4].map((count, index) => (
                <button
                  key={count}
                  type="button"
                  className={`flex h-12 w-12 items-center justify-center rounded-full text-base font-bold ${
                    index === 1
                      ? 'bg-white text-black'
                      : 'border border-[#333333] bg-[#2a2a2a] text-[#888888]'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-[#888888]">Selected: 2 partners</p>
          </div>

          <label className="field-label">
            <span>Note (optional)</span>
            <textarea
              rows={4}
              maxLength={300}
              placeholder="e.g. I'll be at the main gate by 5:45 AM"
              className="field-input min-h-[100px] resize-y"
            />
            <span className="text-right text-xs text-[#888888]">0/300</span>
          </label>

          <div className="rounded-xl border border-[#00d084] bg-[#163628] p-4 text-sm text-[#d7ffed]">
            <p>Your ride will expire automatically after departure.</p>
            <p className="mt-1">You can post multiple rides if needed.</p>
          </div>

          <label className="field-label lg:col-span-2">
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
            className="btn-primary w-full lg:col-span-2"
          >
            {saving ? 'Posting ride...' : 'Post my ride'}
          </button>
        </form>
      </div>
    </section>
  );
}
