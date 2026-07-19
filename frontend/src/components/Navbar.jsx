import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

const navLinkClass = ({ isActive }) => `rounded-xl px-4 py-2 text-sm transition ${
  isActive ? 'bg-[#1f1f1f] text-[#00d084]' : 'text-[#888888] hover:bg-[#1f1f1f] hover:text-white'
}`;

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <header className="top-header">
      <div className="mobile-shell mx-auto flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:max-w-6xl lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#00d084] text-lg font-extrabold text-[#0f0f0f]">
            GG
          </div>
          <div>
            <p className="text-lg font-semibold tracking-wide text-white">GoGather</p>
            <p className="text-xs uppercase tracking-[0.25em] text-[#888888]">Find your ride partner</p>
          </div>
        </Link>

        <nav className="hidden flex-wrap items-center gap-2 md:flex">
          <NavLink to="/create-trip" className={navLinkClass}>Create Trip</NavLink>
          <NavLink to="/trips" className={navLinkClass}>My Rides</NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to="/profile" className={navLinkClass}>Profile</NavLink>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-[#333333] px-4 py-2 text-sm text-[#888888] transition hover:border-[#00d084] hover:text-white"
              >
                Logout
              </button>
              {user?.photoUrl ? (
                <img
                  src={user.photoUrl}
                  alt={user.name}
                  className="h-10 w-10 rounded-full border border-[#333333] object-cover"
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
