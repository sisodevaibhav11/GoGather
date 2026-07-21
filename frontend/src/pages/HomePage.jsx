import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPublicTrips } from '../api.js';
import { useAuth } from '../hooks/useAuth.js';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';
import TripCard from '../components/TripCard.jsx';

const categoryMap = {
  All: '',
  Airport: 'airport',
  Railway: 'railway',
  'Bus Stand': 'bus-stand',
};

function getGreetingTime() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const [selectedTab, setSelectedTab] = useState('All');
  const [publicTrips, setPublicTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  const greetingName = user?.name?.split(' ')[0] || 'traveler';
  const greeting = getGreetingTime();

  useEffect(() => {
    let isMounted = true;
    async function loadTrips() {
      try {
        setLoading(true);
        const transportParam = categoryMap[selectedTab] || '';
        const { data } = await fetchPublicTrips(transportParam);
        if (isMounted) {
          setPublicTrips(data.trips || []);
        }
      } catch {
        if (isMounted) {
          setPublicTrips([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadTrips();
    return () => {
      isMounted = false;
    };
  }, [selectedTab]);

  return (
    <section className="flex flex-1 flex-col gap-5">
      <div className="surface-card p-6">
        <p className="text-sm font-semibold text-[#888888]">
          {greeting}, {greetingName}
        </p>
        <h1 className="mt-3 text-2xl font-extrabold leading-tight text-white sm:text-3xl">
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
        {['All', 'Airport', 'Railway', 'Bus Stand'].map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => setSelectedTab(label)}
            className={`shrink-0 border-b-[3px] px-0 pb-3 text-sm font-semibold transition ${
              selectedTab === label ? 'border-[#00d084] text-white' : 'border-transparent text-[#888888] hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <LoadingSkeleton lines={4} />
          <LoadingSkeleton lines={4} />
        </div>
      ) : publicTrips.length > 0 ? (
        <div className="grid gap-4">
          <h2 className="text-lg font-semibold text-white">Active public rides ({publicTrips.length})</h2>
          {publicTrips.map((trip) => (
            <div key={trip.id} className="relative">
              <TripCard trip={trip} />
              <div className="mt-2 flex justify-end">
                <Link
                  to={`/trip/${trip.shareCode}`}
                  className="rounded-xl border border-[#333333] bg-[#2a2a2a] px-4 py-1.5 text-xs font-semibold text-[#00d084] hover:border-[#00d084]"
                >
                  View & Match →
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="surface-card p-6">
          <div className="mx-auto flex max-w-sm flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#333333] bg-[#181818] text-4xl">
              🚗
            </div>
            <h2 className="mt-5 text-xl font-bold text-white">No {selectedTab !== 'All' ? selectedTab.toLowerCase() : ''} rides available right now</h2>
            <p className="mt-3 text-sm leading-6 text-[#888888]">
              Be the first to post a ride in this category to start matching with nearby travelers.
            </p>
            <Link to={isAuthenticated ? '/create-trip' : '/login'} className="btn-secondary mt-5 w-full">
              Post a ride
            </Link>
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
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
