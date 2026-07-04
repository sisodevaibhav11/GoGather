import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

const navLinkClass = ({ isActive }) => `rounded-full px-4 py-2 text-sm transition ${
  isActive ? 'bg-amber-400 text-stone-950' : 'text-stone-300 hover:bg-stone-800 hover:text-white'
}`;

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <header className="border-b border-stone-800/80 bg-stone-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400 text-lg font-semibold text-stone-950">
            TB
          </div>
          <div>
            <p className="text-lg font-semibold tracking-wide text-white">TravelBuddy</p>
            <p className="text-xs uppercase tracking-[0.25em] text-stone-500">Travel safer together</p>
          </div>
        </Link>

        <nav className="flex flex-wrap items-center gap-2">
          <NavLink to="/create-trip" className={navLinkClass}>Create Trip</NavLink>
          <NavLink to="/trips" className={navLinkClass}>My Matches</NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to="/profile" className={navLinkClass}>Profile</NavLink>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-stone-700 px-4 py-2 text-sm text-stone-200 transition hover:border-amber-400 hover:text-white"
              >
                Logout
              </button>
              {user?.photoUrl ? (
                <img
                  src={user.photoUrl}
                  alt={user.name}
                  className="h-10 w-10 rounded-full border border-stone-700 object-cover"
                />
              ) : null}
            </>
          ) : (
            <NavLink to="/login" className={navLinkClass}>Login</NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
