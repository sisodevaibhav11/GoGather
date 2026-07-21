import { Link } from 'react-router-dom';

export default function Footer() {
  const links = [
    { label: 'How It Works', path: '/how-it-works' },
    { label: 'About', path: '/about' },
    { label: 'Privacy', path: '/privacy' },
    { label: 'Terms', path: '/terms' },
    { label: 'Report Issue', path: '/raise-issue' },
  ];

  return (
    <footer className="hidden border-t border-[#222222] px-4 py-8 md:block">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap justify-center gap-6">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="text-sm text-[#888888] hover:text-white transition"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <p className="text-center text-sm text-[#666666]">
          Copyright {new Date().getFullYear()} GoGather. Travel safer, together.
        </p>
      </div>
    </footer>
  );
}
