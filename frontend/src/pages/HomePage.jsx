import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="grid flex-1 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="rounded-[2rem] border border-stone-800 bg-stone-900/80 p-8 sm:p-10">
        <p className="text-sm uppercase tracking-[0.32em] text-amber-300">Travel companion matching</p>
        <h1 className="mt-5 max-w-2xl text-4xl font-semibold leading-tight text-white sm:text-5xl">
          Stop asking group chats who is reaching the station. Share one link and find your travel buddy.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-stone-300">
          TravelBuddy helps students and public travelers match with people arriving at the same station,
          bus stand, or airport around the same time. Contact details stay private until both sides choose to connect.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to={isAuthenticated ? '/create-trip' : '/login'}
            className="rounded-full bg-amber-400 px-5 py-3 font-semibold text-stone-950 transition hover:bg-amber-300"
          >
            Create Trip
          </Link>
          <Link
            to={isAuthenticated ? '/trips' : '/login'}
            className="rounded-full border border-stone-700 px-5 py-3 font-semibold text-white transition hover:border-white"
          >
            My Matches
          </Link>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="rounded-[2rem] border border-stone-800 bg-card/80 p-6">
          <h2 className="text-xl font-semibold text-white">How it works</h2>
          <div className="mt-5 grid gap-4 text-sm text-stone-300">
            <div className="rounded-2xl bg-stone-950/60 p-4">
              Create your trip with arrival place, date, time, and your preferred matching window.
            </div>
            <div className="rounded-2xl bg-stone-950/60 p-4">
              TravelBuddy finds nearby arrivals on the same date and sorts the closest timings first.
            </div>
            <div className="rounded-2xl bg-stone-950/60 p-4">
              Phone numbers unlock only after both travelers tap Connect.
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-stone-800 bg-stone-900/80 p-6">
          <h2 className="text-xl font-semibold text-white">Built for real usage</h2>
          <p className="mt-3 text-sm leading-7 text-stone-300">
            Friendly empty states, copyable share links, manual trip status, lightweight reporting, and a small AI
            assistant help this stay practical instead of bloated.
          </p>
        </div>
      </div>
    </section>
  );
}
