import { Link } from 'react-router-dom';

export default function ProfileCompletionBanner() {
  return (
    <div className="rounded-2xl border border-[#00d084] bg-[#163628] p-4 text-sm text-[#d7ffed]">
      Add your mobile number before creating a trip. Your number stays hidden until both travelers tap Connect.
      {' '}
      <Link to="/profile" className="font-semibold text-[#00d084] underline underline-offset-4">
        Complete profile
      </Link>
    </div>
  );
}
