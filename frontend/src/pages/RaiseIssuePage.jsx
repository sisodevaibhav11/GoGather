import { useState } from 'react';
import toast from 'react-hot-toast';
import { submitIssue } from '../api.js';

export default function RaiseIssuePage() {
  const [form, setForm] = useState({
    type: 'bug',
    email: '',
    subject: '',
    description: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setSubmitting(true);
      await submitIssue(form);
      toast.success('Thank you! Your issue has been submitted.');
      setSubmitted(true);
      
      setTimeout(() => {
        setForm({ type: 'bug', email: '', subject: '', description: '' });
        setSubmitted(false);
      }, 3000);
    } catch {
      toast.error('Could not submit issue. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const issueTypes = [
    { value: 'bug', label: 'Bug Report', desc: 'Something is broken or not working correctly' },
    { value: 'feature', label: 'Feature Request', desc: 'Suggest a new feature or improvement' },
    { value: 'account', label: 'Account Issue', desc: 'Problems with login, profile, or account' },
    { value: 'safety', label: 'Safety Concern', desc: 'Report unsafe behavior or suspicious users' },
    { value: 'other', label: 'Other', desc: 'General feedback or other issues' },
  ];

  const faqs = [
    {
      q: 'How long does it take to resolve an issue?',
      a: 'Critical issues (bugs, safety) are reviewed within 24 hours. Feature requests are reviewed weekly. We\'ll update you via email.',
    },
    {
      q: 'What happens if I report a user?',
      a: 'Reports are investigated by our safety team. If violations are confirmed, we take appropriate action including warnings or account suspension.',
    },
    {
      q: 'Can I track the status of my issue?',
      a: 'Yes! You\'ll receive email updates as your issue is reviewed, investigated, and resolved.',
    },
    {
      q: 'Is my report confidential?',
      a: 'Yes. Reports are only visible to our support and safety teams. Details are kept confidential.',
    },
    {
      q: 'What if I want to report anonymously?',
      a: 'You can submit a report without logging in. However, providing an email helps us update you on resolution.',
    },
  ];

  if (submitted) {
    return (
      <section className="mx-auto w-full max-w-6xl">
        <div className="surface-card p-8 text-center">
          <div className="mx-auto mb-4 text-6xl">✓</div>
          <h2 className="text-2xl font-semibold text-white">Thank You!</h2>
          <p className="mt-3 text-[#888888]">
            Your issue has been submitted successfully. Our team will review it and get back to you soon.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-6xl">
      {/* Header */}
      <div className="surface-card mb-8 p-6 text-center sm:p-8">
        <h1 className="text-4xl font-bold text-white">Raise an Issue</h1>
        <p className="mt-3 text-[#888888]">
          Help us improve GoGather. Report bugs, suggest features, or share safety concerns.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="surface-card p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Issue Type */}
              <div>
                <label className="block text-sm font-semibold text-white">Issue Type</label>
                <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
                  {issueTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setForm((c) => ({ ...c, type: type.value }))}
                      className={`rounded-lg border px-4 py-3 text-left text-sm transition ${
                        form.type === type.value
                          ? 'border-[#00d084] bg-[#2a2a2a]'
                          : 'border-[#333333] bg-transparent hover:border-[#444444]'
                      }`}
                    >
                      <span className="font-semibold text-white">{type.label}</span>
                      <p className="mt-1 text-xs text-[#888888]">{type.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Email */}
              <label className="field-label">
                <span>Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))}
                  placeholder="your@email.com (optional)"
                  className="field-input"
                />
              </label>

              {/* Subject */}
              <label className="field-label">
                <span>Subject *</span>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm((c) => ({ ...c, subject: e.target.value }))}
                  placeholder="Brief summary of the issue"
                  className="field-input"
                  required
                />
              </label>

              {/* Description */}
              <label className="field-label">
                <span>Description *</span>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))}
                  placeholder="Detailed explanation..."
                  rows={6}
                  className="field-input"
                  required
                />
              </label>

              <button type="submit" disabled={submitting} className="btn-primary w-full">
                {submitting ? 'Submitting Issue...' : 'Submit Issue'}
              </button>
            </form>
          </div>
        </div>

        {/* FAQs */}
        <div>
          <div className="surface-card p-6 sm:p-8">
            <h3 className="text-lg font-semibold text-white">FAQs</h3>
            <div className="mt-6 space-y-6">
              {faqs.map((faq, idx) => (
                <div key={idx}>
                  <p className="font-medium text-white">{faq.q}</p>
                  <p className="mt-2 text-xs leading-5 text-[#888888]">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
