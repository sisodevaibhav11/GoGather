import { Link } from 'react-router-dom';

export default function ProfileCompletionBanner() {
  return (
    <div className="surface-card border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
      Add your mobile number before creating a trip. Your number stays hidden until both travelers tap Connect.
      {' '}
      <Link to="/profile" className="font-semibold text-amber-700 underline underline-offset-4">
        Complete profile
      </Link>
    </div>
  );
}
