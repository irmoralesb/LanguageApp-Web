import type { MessageFeedback } from '../types'

interface Props {
  feedback: MessageFeedback | null
}

export function FeedbackPanel({ feedback }: Props) {
  const hasCorrections = (feedback?.corrections?.length ?? 0) > 0
  const hasRecommendations = (feedback?.recommendations?.length ?? 0) > 0
  const isEmpty = !hasCorrections && !hasRecommendations

  return (
    <aside className="flex w-80 shrink-0 flex-col border-l border-slate-200 bg-slate-50">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-700">Feedback</h2>
        <p className="mt-0.5 text-xs text-slate-400">
          Real-time analysis of your latest message
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {!feedback && (
          <p className="text-center text-xs text-slate-400 mt-6">
            Send a message to receive feedback.
          </p>
        )}

        {feedback && isEmpty && (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            Great job! No corrections or recommendations for this message.
          </div>
        )}

        {hasCorrections && (
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-red-600">
              Corrections
            </h3>
            <ul className="space-y-3">
              {feedback!.corrections.map((c, i) => (
                <li
                  key={i}
                  className="rounded-xl border border-red-100 bg-white p-3 shadow-sm"
                >
                  <p className="text-xs text-slate-500 line-through">{c.original}</p>
                  <p className="mt-1 text-sm font-medium text-slate-800">{c.suggestion}</p>
                  <p className="mt-1 text-xs text-slate-400">{c.issue}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {hasRecommendations && (
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-indigo-600">
              Recommendations
            </h3>
            <ul className="space-y-3">
              {feedback!.recommendations.map((r, i) => (
                <li
                  key={i}
                  className="rounded-xl border border-indigo-100 bg-white p-3 shadow-sm"
                >
                  <p className="text-xs text-slate-500">Instead of: <em>{r.original}</em></p>
                  <p className="mt-1 text-sm font-semibold text-indigo-700">
                    {r.better_expression}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">{r.reason}</p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </aside>
  )
}
