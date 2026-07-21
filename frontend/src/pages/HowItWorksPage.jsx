export default function HowItWorksPage() {
  const steps = [
    {
      step: 1,
      title: 'Create Your Trip',
      description: 'Share your travel details: arrival location, destination, date, and time. Choose your transport type (airport, railway, or bus stand) and direction.',
    },
    {
      step: 2,
      title: 'Get a Shareable Link',
      description: 'Each trip gets a unique shareable code. Share it with friends or on social media so they can create matching trips.',
    },
    {
      step: 3,
      title: 'Auto-Matching Algorithm',
      description: 'GoGather finds compatible travelers automatically. Matches are ranked by location proximity, arrival time, and destination.',
    },
    {
      step: 4,
      title: 'Safe Connection Request',
      description: 'Send a connection request to a matched traveler. Phone numbers stay hidden until both of you consent (mutual connection).',
    },
    {
      step: 5,
      title: 'Reveal & Coordinate',
      description: 'Once connected, phone numbers are revealed. Use our AI travel assistant for meeting points, fares, and safety tips.',
    },
    {
      step: 6,
      title: 'Travel Together',
      description: 'Coordinate your ride, travel safely with your match, and mark your trip as complete when done.',
    },
  ];

  const features = [
    { title: 'Smart Matching', desc: 'Location, date, and time-based compatibility scoring' },
    { title: 'Privacy First', desc: 'Phone numbers hidden until mutual consent' },
    { title: 'AI Assistant', desc: 'Get meeting points, fare estimates, and safety tips' },
    { title: 'Group Trips', desc: 'Create groups with matched travelers for larger journeys' },
    { title: 'Safety Report', desc: 'Report suspicious users to keep the community safe' },
    { title: 'Real-time Updates', desc: 'Get instant notifications when someone connects with you' },
  ];

  return (
    <section className="mx-auto w-full max-w-6xl">
      {/* Hero */}
      <div className="surface-card mb-8 p-6 text-center sm:p-8">
        <h1 className="text-4xl font-bold text-white">How GoGather Works</h1>
        <p className="mt-3 text-lg text-[#888888]">
          Safe, smart, and simple. Connect with nearby travelers heading your way.
        </p>
      </div>

      {/* Steps */}
      <div className="surface-card mb-8 p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-white">6 Simple Steps</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((item) => (
            <div key={item.step} className="surface-soft rounded-xl p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00d084] text-black font-bold">
                {item.step}
              </div>
              <h3 className="mt-3 font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm text-[#888888]">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="surface-card p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-white">Key Features</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="flex gap-4">
              <div className="mt-1 h-2 w-2 rounded-full bg-[#00d084] flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-white">{feature.title}</h3>
                <p className="mt-1 text-sm text-[#888888]">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
