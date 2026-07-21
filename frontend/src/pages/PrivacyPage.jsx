export default function PrivacyPage() {
  const sections = [
    {
      title: 'Information We Collect',
      content: `We collect information you voluntarily provide including:
• Personal Information: Name, email, phone number, profile photo
• Location Data: Arrival location, destination coordinates
• Trip Details: Travel date, arrival time, transport type
• Communication: Messages, connection requests, reports`,
    },
    {
      title: 'How We Use Your Information',
      content: `Your information is used to:
• Match you with compatible travelers
• Enable safe connections via our platform
• Improve our matching algorithm
• Send notifications about trip matches and connections
• Enforce our community guidelines
• Resolve disputes and safety concerns`,
    },
    {
      title: 'Phone Number Privacy',
      content: `Your phone number is:
• Never visible to other users until you establish a mutual connection
• Only revealed when both parties consent to connecting
• Protected by our database encryption
• Never shared with third parties`,
    },
    {
      title: 'Data Security',
      content: `We protect your data through:
• HTTPS encryption for all communications
• Secure password hashing with bcryptjs
• JWT token-based authentication
• MongoDB database encryption
• Regular security audits`,
    },
    {
      title: 'Third-Party Integrations',
      content: `We use:
• Google OAuth for secure login
• Cloudinary for image storage and CDN delivery
• OpenAI for travel advice (anonymized trip data only)
• Nominatim for location geocoding
• None of these services store your phone number`,
    },
    {
      title: 'Your Rights',
      content: `You have the right to:
• Access your personal data
• Request corrections to inaccurate information
• Delete your account and all associated data
• Opt-out of notifications
• Report privacy concerns to our support team`,
    },
    {
      title: 'Data Retention',
      content: `We retain:
• Completed trip records for 6 months
• Connection history for 12 months
• Reports indefinitely (for community safety)
• You can request deletion anytime (except legally required data)`,
    },
    {
      title: 'Changes to This Policy',
      content: `We may update this privacy policy periodically. We will notify you of significant changes via email. Continued use constitutes acceptance of the updated policy.`,
    },
  ];

  return (
    <section className="mx-auto w-full max-w-4xl">
      {/* Header */}
      <div className="surface-card mb-8 p-6 sm:p-8">
        <h1 className="text-4xl font-bold text-white">Privacy Policy</h1>
        <p className="mt-3 text-[#888888]">Last updated: July 2026</p>
      </div>

      {/* Content */}
      <div className="surface-card p-6 sm:p-8">
        <p className="mb-8 leading-7 text-[#888888]">
          GoGather is committed to protecting your privacy. This policy explains how we collect, use, and protect your personal information.
        </p>

        <div className="space-y-8">
          {sections.map((section, idx) => (
            <div key={idx} className="border-b border-[#333333] pb-8 last:border-0">
              <h2 className="text-xl font-semibold text-white">{section.title}</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#888888]">
                {section.content}
              </p>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="mt-8 rounded-xl border border-[#333333] bg-[#2a2a2a] p-5">
          <p className="font-semibold text-white">Questions about our privacy practices?</p>
          <p className="mt-2 text-sm text-[#888888]">
            Contact us at{' '}
            <a href="mailto:privacy@gogather.example" className="text-[#00d084] hover:underline">
              privacy@gogather.example
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
