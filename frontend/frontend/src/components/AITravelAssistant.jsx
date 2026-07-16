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
    <section className="rounded-3xl border border-stone-800 bg-stone-900/80 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-stone-500">AI Travel Assistant</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Quick help for coordination and safety</h2>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {starterQuestions.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => handleAsk(item)}
            className="rounded-full border border-stone-700 px-3 py-2 text-sm text-stone-200 transition hover:border-amber-400 hover:text-white"
          >
            {item}
          </button>
        ))}
      </div>

      <textarea
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
        rows={4}
        className="mt-4 w-full rounded-2xl border border-stone-700 bg-stone-950 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-400"
        placeholder="Ask about meeting points, delays, or shared fare..."
      />
      <button
        type="button"
        onClick={() => handleAsk()}
        disabled={loading || question.trim().length < 6}
        className="mt-3 rounded-full bg-sky-300 px-4 py-2 text-sm font-semibold text-stone-950 transition hover:bg-sky-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Thinking...' : 'Ask assistant'}
      </button>

      <div className="mt-4 rounded-2xl border border-stone-800 bg-stone-950/70 p-4">
        <p className="text-sm whitespace-pre-line text-stone-200">
          {loading ? 'Working on a helpful answer...' : answer || 'Your answer will appear here.'}
        </p>
      </div>
    </section>
  );
}
