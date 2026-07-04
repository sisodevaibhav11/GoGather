import { Link } from 'react-router-dom';

export default function ProfileCompletionBanner() {
  return (
    <div className="rounded-3xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-50">
      Add your mobile number before creating a trip. Your number stays hidden until both travelers tap Connect.
      {' '}
      <Link to="/profile" className="font-semibold text-amber-300 underline underline-offset-4">
        Complete profile
      </Link>
    </div>
  );
}
