import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="grid flex-1 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="surface-card p-8 sm:p-10">
        <p className="section-kicker">Travel companion matching</p>
        <h1 className="mt-5 max-w-2xl text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
          Match arrivals, share one link, and coordinate your trip without exposing contact details early.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
          GoGather helps students and public travelers match with people arriving at the same station,
          bus stand, or airport around the same time. Contact details stay private until both sides choose to connect.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to={isAuthenticated ? '/create-trip' : '/login'}
            className="btn-primary"
          >
            Create Trip
          </Link>
          <Link
            to={isAuthenticated ? '/trips' : '/login'}
            className="btn-secondary"
          >
            My Matches
          </Link>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="surface-card p-6">
          <h2 className="text-xl font-semibold text-slate-900">How it works</h2>
          <div className="mt-5 grid gap-4 text-sm text-slate-600">
            <div className="surface-soft p-4">
              Create your trip with arrival place, date, time, and your preferred matching window.
            </div>
            <div className="surface-soft p-4">
              GoGather finds nearby arrivals on the same date and sorts the closest timings first.
            </div>
            <div className="surface-soft p-4">
              Phone numbers unlock only after both travelers tap Connect.
            </div>
          </div>
        </div>

        <div className="surface-card p-6">
          <h2 className="text-xl font-semibold text-slate-900">Built for real usage</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Friendly empty states, copyable share links, manual trip status, lightweight reporting, and a small AI
            assistant help this stay practical instead of bloated.
          </p>
        </div>
      </div>
    </section>
  );
}
