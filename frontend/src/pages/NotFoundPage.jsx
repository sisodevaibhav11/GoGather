import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section className="mx-auto flex max-w-2xl flex-1 items-center">
      <div className="surface-card w-full p-8 text-center">
        <p className="section-kicker">404</p>
        <h1 className="mt-4 text-3xl font-semibold text-slate-900">This route does not exist</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          The trip link may be broken, or the page has moved.
        </p>
        <Link
          to="/"
          className="btn-primary mt-6"
        >
          Go home
        </Link>
      </div>
    </section>
  );
}
