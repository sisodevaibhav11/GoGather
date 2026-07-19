import { NavLink } from 'react-router-dom';
import { HiOutlineHome, HiOutlinePlusCircle, HiOutlineUser } from 'react-icons/hi2';
import { PiCarProfileBold } from 'react-icons/pi';

const items = [
  { to: '/', label: 'Home', icon: HiOutlineHome },
  { to: '/create-trip', label: 'Post', icon: HiOutlinePlusCircle },
  { to: '/trips', label: 'Rides', icon: PiCarProfileBold },
  { to: '/profile', label: 'Profile', icon: HiOutlineUser },
];

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[#333333] bg-[#0f0f0f]/95 px-3 py-2 backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-[480px] grid-cols-4 gap-2 pb-[max(8px,env(safe-area-inset-bottom))]">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[11px] transition ${
              isActive ? 'bg-[#1a1a1a] text-[#00d084]' : 'text-[#555555]'
            }`}
          >
            <Icon className="text-[22px]" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
