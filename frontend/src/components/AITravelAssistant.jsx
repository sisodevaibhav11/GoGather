import { useState } from 'react';
import toast from 'react-hot-toast';
import { askAiAssistant } from '../api.js';

const starterQuestions = [
  'Suggest a safe meeting point',
  'What should I do if my train is delayed?',
  'Estimate a shared cab fare for this trip',
];

export default function AITravelAssistant({ tripId }) {
  const [question, setQuestion] = useState(starterQuestions[0]);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleAsk(nextQuestion = question) {
    try {
      setLoading(true);
      setQuestion(nextQuestion);
      const { data } = await askAiAssistant({ tripId, question: nextQuestion });
      setAnswer(data.answer);
      if (data.usedFallback) {
        toast('AI used the fallback helper for this answer.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'AI assistant is unavailable right now.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="surface-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="section-kicker">AI travel assistant</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">Quick help for coordination and safety</h2>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {starterQuestions.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => handleAsk(item)}
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition hover:border-teal-600 hover:text-teal-700"
          >
            {item}
          </button>
        ))}
      </div>

      <textarea
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
        rows={4}
        className="field-input mt-4 text-sm"
        placeholder="Ask about meeting points, delays, or shared fare..."
      />
      <button
        type="button"
        onClick={() => handleAsk()}
        disabled={loading || question.trim().length < 6}
        className="btn-primary mt-3"
      >
        {loading ? 'Thinking...' : 'Ask assistant'}
      </button>

      <div className="surface-soft mt-4 p-4">
        <p className="whitespace-pre-line text-sm text-slate-700">
          {loading ? 'Working on a helpful answer...' : answer || 'Your answer will appear here.'}
        </p>
      </div>
    </section>
  );
}
