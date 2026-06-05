interface SentenceSkillsHubProps {
  onStartConfusableWords: () => void
  onStartNaturalRewrite: () => void
  onStartRegisterPractice: () => void
}

export function SentenceSkillsHub({
  onStartConfusableWords,
  onStartNaturalRewrite,
  onStartRegisterPractice,
}: SentenceSkillsHubProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="font-semibold text-slate-900">Confusable words</h3>
        <p className="mt-2 text-sm text-slate-600">
          Fill in the blank when two similar English words are easily confused, such as affect vs
          effect.
        </p>
        <button
          type="button"
          onClick={onStartConfusableWords}
          className="mt-4 w-full rounded-lg bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-700"
        >
          Start confusable drill
        </button>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="font-semibold text-slate-900">Natural rewrite</h3>
        <p className="mt-2 text-sm text-slate-600">
          Rewrite stiff or overly formal English into a natural, conversational sentence.
        </p>
        <button
          type="button"
          onClick={onStartNaturalRewrite}
          className="mt-4 w-full rounded-lg bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-700"
        >
          Start rewrite drill
        </button>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:col-span-2 lg:col-span-1">
        <h3 className="font-semibold text-slate-900">Register practice</h3>
        <p className="mt-2 text-sm text-slate-600">
          Switch sentences between formal, neutral, and casual registers while keeping the same
          meaning.
        </p>
        <button
          type="button"
          onClick={onStartRegisterPractice}
          className="mt-4 w-full rounded-lg bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-700"
        >
          Start register drill
        </button>
      </div>
    </div>
  )
}
