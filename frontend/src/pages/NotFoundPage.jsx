import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section className="mx-auto flex max-w-2xl flex-1 items-center">
      <div className="w-full rounded-[2rem] border border-stone-800 bg-stone-900/85 p-8 text-center">
        <p className="text-sm uppercase tracking-[0.28em] text-stone-500">404</p>
        <h1 className="mt-4 text-3xl font-semibold text-white">This route does not exist</h1>
        <p className="mt-3 text-sm leading-7 text-stone-300">
          The trip link may be broken, or the page has moved.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-full bg-amber-400 px-5 py-3 font-semibold text-stone-950"
        >
          Go home
        </Link>
      </div>
    </section>
  );
}
