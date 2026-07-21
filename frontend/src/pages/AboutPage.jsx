export default function AboutPage() {
  const team = [
    {
      name: 'Mission',
      desc: 'Make travel safer and more affordable by connecting nearby travelers heading to the same destination.',
    },
    {
      name: 'Vision',
      desc: 'Create a trusted community where travelers can share journeys, save money, and build friendships.',
    },
    {
      name: 'Values',
      desc: 'Safety first. Transparency in all interactions. Community-driven growth and continuous improvement.',
    },
  ];

  const tech = [
    { name: 'Frontend', techs: 'React, Vite, Tailwind CSS, React Router' },
    { name: 'Backend', techs: 'Node.js, Express, MongoDB, Mongoose' },
    { name: 'Authentication', techs: 'JWT, Google OAuth' },
    { name: 'API Integration', techs: 'OpenAI, Nominatim, Cloudinary' },
    { name: 'Deployment', techs: 'Vercel (Frontend & Backend)' },
  ];

  return (
    <section className="mx-auto w-full max-w-6xl">
      {/* Hero */}
      <div className="surface-card mb-8 p-6 text-center sm:p-8">
        <h1 className="text-4xl font-bold text-white">About GoGather</h1>
        <p className="mt-3 text-lg text-[#888888]">
          Connecting travelers, reducing costs, building community.
        </p>
      </div>

      {/* Mission, Vision, Values */}
      <div className="surface-card mb-8 p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-white">Our Purpose</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {team.map((item) => (
            <div key={item.name} className="surface-soft rounded-xl p-6">
              <h3 className="font-semibold text-[#00d084]">{item.name}</h3>
              <p className="mt-3 text-sm leading-6 text-[#888888]">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="surface-card p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-white">Built With</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          {tech.map((item) => (
            <div key={item.name} className="surface-soft rounded-xl p-4">
              <h3 className="font-semibold text-white">{item.name}</h3>
              <p className="mt-3 text-xs leading-5 text-[#888888]">{item.techs}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="mt-8 surface-card p-6 text-center sm:p-8">
        <h3 className="text-xl font-semibold text-white">Get in Touch</h3>
        <p className="mt-3 text-[#888888]">Have questions? Found a bug? Want to contribute?</p>
        <p className="mt-2">
          <a href="mailto:support@gogather.example" className="text-[#00d084] hover:underline">
            support@gogather.example
          </a>
        </p>
      </div>
    </section>
  );
}
