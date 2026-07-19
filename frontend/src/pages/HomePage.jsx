import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const greetingName = user?.name?.split(' ')[0] || 'traveler';

  return (
    <section className="flex flex-1 flex-col gap-5">
      <div className="surface-card p-6">
        <p className="text-sm font-semibold text-[#888888]">
          {isAuthenticated ? `Good afternoon, ${greetingName}` : 'Good afternoon'}
        </p>
        <h1 className="mt-3 text-2xl font-extrabold leading-tight text-white">
          Find ride partners for airport, railway, and bus stand trips.
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#888888]">
          Post your plan once, match with nearby travelers, and reveal contact details only after mutual interest.
        </p>

        <div className="mt-5 flex gap-3">
          <Link to={isAuthenticated ? '/create-trip' : '/login'} className="btn-primary flex-1">
            Post a ride
          </Link>
          <Link to={isAuthenticated ? '/trips' : '/login'} className="btn-secondary flex-1">
            My rides
          </Link>
        </div>
      </div>

      <div className="flex gap-5 overflow-x-auto border-b border-[#222222] pb-1">
        {['All', 'Airport', 'Railway', 'Bus Stand'].map((label, index) => (
          <button
            key={label}
            type="button"
            className={`shrink-0 border-b-[3px] px-0 pb-3 text-sm font-semibold transition ${
              index === 0 ? 'border-[#00d084] text-white' : 'border-transparent text-[#888888]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="surface-card p-6">
        <div className="mx-auto flex max-w-sm flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#333333] bg-[#181818] text-4xl">
            🚗
          </div>
          <h2 className="mt-5 text-xl font-bold text-white">No rides available right now</h2>
          <p className="mt-3 text-sm leading-6 text-[#888888]">
            All current rides are full. Check back later or post your own ride to start matching.
          </p>
          <Link to={isAuthenticated ? '/create-trip' : '/login'} className="btn-secondary mt-5 w-full">
            Post a ride
          </Link>
        </div>
      </div>

      <div className="grid gap-3">
        <div className="surface-soft p-4">
          <p className="text-sm font-semibold text-white">Share once</p>
          <p className="mt-1 text-xs text-[#888888]">Create a ride and send one link into your group.</p>
        </div>
        <div className="surface-soft p-4">
          <p className="text-sm font-semibold text-white">Match by timing</p>
          <p className="mt-1 text-xs text-[#888888]">Nearby arrivals are sorted by the closest time window.</p>
        </div>
        <div className="surface-soft p-4">
          <p className="text-sm font-semibold text-white">Connect safely</p>
          <p className="mt-1 text-xs text-[#888888]">Phone numbers stay hidden until both riders choose to connect.</p>
        </div>
      </div>
    </section>
  );
}
