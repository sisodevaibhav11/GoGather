import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

const navLinkClass = ({ isActive }) => `rounded-full px-4 py-2 text-sm transition ${
  isActive ? 'bg-teal-700 text-white' : 'text-slate-600 hover:bg-white hover:text-slate-900'
}`;

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-700 text-lg font-semibold text-white">
            GG
          </div>
          <div>
            <p className="text-lg font-semibold tracking-wide text-slate-900">GoGather</p>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Travel smarter together</p>
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
                className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700 transition hover:border-teal-700 hover:text-teal-700"
              >
                Logout
              </button>
              {user?.photoUrl ? (
                <img
                  src={user.photoUrl}
                  alt={user.name}
                  className="h-10 w-10 rounded-full border border-slate-200 object-cover"
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
