export default function TermsPage() {
  const sections = [
    {
      title: 'Acceptance of Terms',
      content: 'By using GoGather, you agree to these terms and conditions. If you do not agree, you may not use our service. We reserve the right to modify these terms at any time.',
    },
    {
      title: 'User Responsibilities',
      content: `You agree to:
• Provide accurate and truthful information
• Keep your password confidential
• Not engage in fraudulent or illegal activities
• Respect other users and follow community guidelines
• Report suspicious or unsafe behavior
• Not misuse the platform (spam, harassment, etc.)`,
    },
    {
      title: 'Account Termination',
      content: 'GoGather reserves the right to suspend or terminate accounts that violate these terms, including fraudulent activity, harassment, or repeated safety violations. Terminated accounts lose access to all data.',
    },
    {
      title: 'Limitation of Liability',
      content: 'GoGather is provided "as is" without warranties. We are not liable for:• Direct or indirect damages from using the service• Third-party actions or content• Travel accidents or injuries• Loss of data or income',
    },
    {
      title: 'Dispute Resolution',
      content: 'In case of disputes between users, both parties should attempt resolution directly. GoGather may mediate but is not responsible for outcomes. Any legal disputes will be governed by applicable laws.',
    },
    {
      title: 'Prohibited Activities',
      content: `You must not:
• Impersonate others or create fake accounts
• Share phone numbers or contact info before connecting
• Engage in illegal transactions or services
• Harass, threaten, or abuse other users
• Collect or store user data without consent
• Attempt to access restricted areas`,
    },
    {
      title: 'Intellectual Property',
      content: 'GoGather, its logo, design, and content are owned by GoGather or licensed partners. You may not reproduce, distribute, or transmit any content without explicit permission.',
    },
    {
      title: 'Third-Party Links',
      content: 'GoGather may contain links to third-party services. We are not responsible for their content, accuracy, or practices. Use at your own risk.',
    },
    {
      title: 'User-Generated Content',
      content: 'By posting content (trip notes, messages), you grant GoGather a license to use, display, and distribute it. We may remove content that violates these terms.',
    },
    {
      title: 'Modifications to Service',
      content: 'We may modify, suspend, or discontinue features at any time. We are not liable for any inconvenience caused by service changes.',
    },
  ];

  return (
    <section className="mx-auto w-full max-w-4xl">
      {/* Header */}
      <div className="surface-card mb-8 p-6 sm:p-8">
        <h1 className="text-4xl font-bold text-white">Terms of Service</h1>
        <p className="mt-3 text-[#888888]">Last updated: July 2026</p>
      </div>

      {/* Content */}
      <div className="surface-card p-6 sm:p-8">
        <p className="mb-8 leading-7 text-[#888888]">
          These Terms of Service ("Terms") govern your use of the GoGather platform and services. By accessing and using GoGather, you accept these terms in full.
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

        {/* Acknowledgment */}
        <div className="mt-8 rounded-xl border border-[#333333] bg-[#2a2a2a] p-5">
          <p className="text-sm text-[#888888]">
            By using GoGather, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          </p>
        </div>
      </div>
    </section>
  );
}
