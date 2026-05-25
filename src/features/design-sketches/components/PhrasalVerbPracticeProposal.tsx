import { useMemo, useState } from 'react'
import {
  MOCK_PHRASAL_EXERCISE,
  MOCK_PHRASAL_VERBS,
  type SketchPhrasalVerb,
} from '../mockData'

type PracticeMode = 'all' | 'one'

type PhrasalVerbPracticeProposalProps = {
  accent: 'teal' | 'indigo' | 'blue'
  compact?: boolean
  onBack?: () => void
}

const ACCENT_STYLES = {
  teal: {
    soft: 'bg-teal-50 text-teal-900 border-teal-100',
    button: 'bg-teal-600 hover:bg-teal-700',
    ring: 'border-teal-400 bg-teal-50',
    text: 'text-teal-700',
  },
  indigo: {
    soft: 'bg-indigo-50 text-indigo-900 border-indigo-100',
    button: 'bg-indigo-600 hover:bg-indigo-700',
    ring: 'border-indigo-400 bg-indigo-50',
    text: 'text-indigo-700',
  },
  blue: {
    soft: 'bg-blue-50 text-blue-900 border-blue-100',
    button: 'bg-blue-600 hover:bg-blue-700',
    ring: 'border-blue-400 bg-blue-50',
    text: 'text-blue-700',
  },
} as const

export function PhrasalVerbPracticeProposal({
  accent,
  compact = false,
  onBack,
}: PhrasalVerbPracticeProposalProps) {
  const styles = ACCENT_STYLES[accent]
  const [screen, setScreen] = useState<'setup' | 'exercise'>('setup')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(['give-up', 'look-after', 'run-into', 'turn-down']),
  )
  const [practiceMode, setPracticeMode] = useState<PracticeMode>('all')
  const [focusVerbId, setFocusVerbId] = useState('give-up')
  const [answer, setAnswer] = useState('')
  const [attempt, setAttempt] = useState<1 | 2>(1)
  const [showHint, setShowHint] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedDefinitionIds, setExpandedDefinitionIds] = useState<Set<string>>(new Set())
  const [customVerbs, setCustomVerbs] = useState<SketchPhrasalVerb[]>([])
  const [addingVerb, setAddingVerb] = useState(false)
  const [newVerbText, setNewVerbText] = useState('')
  const [newVerbDefinition, setNewVerbDefinition] = useState('')

  const catalogVerbs = useMemo(
    () => [...MOCK_PHRASAL_VERBS, ...customVerbs],
    [customVerbs],
  )

  const selectedVerbs = useMemo(
    () => catalogVerbs.filter((verb) => selectedIds.has(verb.id)),
    [catalogVerbs, selectedIds],
  )

  const filteredVerbs = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()
    if (!normalizedSearch) return catalogVerbs

    return catalogVerbs.filter((verb) =>
      [verb.text, verb.definition, verb.strength].some((value) =>
        value.toLowerCase().includes(normalizedSearch),
      ),
    )
  }, [catalogVerbs, searchTerm])

  const toggleVerb = (verb: SketchPhrasalVerb) => {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(verb.id)) {
        next.delete(verb.id)
      } else {
        next.add(verb.id)
      }
      return next
    })
  }

  const toggleDefinition = (verbId: string) => {
    setExpandedDefinitionIds((current) => {
      const next = new Set(current)
      if (next.has(verbId)) {
        next.delete(verbId)
      } else {
        next.add(verbId)
      }
      return next
    })
  }

  const addCustomVerb = () => {
    const text = newVerbText.trim().toLowerCase()
    const definition = newVerbDefinition.trim()
    if (!text || !definition) return

    const id = `custom-${text.replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`
    const newVerb: SketchPhrasalVerb = {
      id,
      text,
      definition,
      example: '',
      strength: 'New',
    }

    setCustomVerbs((current) => [...current, newVerb])
    setSelectedIds((current) => new Set(current).add(id))
    setNewVerbText('')
    setNewVerbDefinition('')
    setAddingVerb(false)
  }

  const startExercise = () => {
    setScreen('exercise')
    setAnswer('')
    setAttempt(1)
    setShowHint(false)
    setShowFeedback(false)
  }

  const handleRetry = () => {
    setAttempt(2)
    setAnswer('')
    setShowFeedback(false)
  }

  if (screen === 'exercise') {
    return (
      <section className={compact ? '' : 'mx-auto max-w-2xl'}>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className={`mb-4 text-sm ${styles.text} hover:underline`}
          >
            Back to modules
          </button>
        )}
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Selected verb list is hidden during practice. The learner only sees the exercise prompt,
          progress, hint, retries, and feedback.
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className={`text-sm font-semibold ${styles.text}`}>Phrasal Verbs Practice</p>
              <h2 className="text-xl font-bold text-slate-900">Translate the sentence</h2>
            </div>
            <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {practiceMode === 'all'
                ? `${selectedVerbs.length} saved verbs in rotation`
                : 'Focused practice'}
            </div>
          </div>

          <div className={`mb-5 rounded-xl border p-4 ${styles.soft}`}>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide opacity-70">
              Scenario
            </p>
            <p className="text-sm">{MOCK_PHRASAL_EXERCISE.scenario}</p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Sentence
            </p>
            <p className="text-lg font-medium text-slate-900">
              {MOCK_PHRASAL_EXERCISE.nativeSentence}
            </p>
          </div>

          <label htmlFor="phrasal-answer" className="mb-1 mt-5 block text-sm font-medium text-slate-700">
            Your answer in English
          </label>
          <textarea
            id="phrasal-answer"
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            disabled={showFeedback}
            rows={compact ? 3 : 4}
            placeholder="Type your sentence here..."
            className="block w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-800 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-50"
          />

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => setShowHint((value) => !value)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              {showHint ? 'Hide hint' : 'Show hint'}
            </button>
            {!showFeedback && (
              <button
                type="button"
                onClick={() => setShowFeedback(true)}
                disabled={!answer.trim()}
                className={`rounded-lg px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 ${styles.button}`}
              >
                {attempt === 1 ? 'Check answer' : 'Submit retry'}
              </button>
            )}
          </div>

          {showHint && (
            <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900">
              {MOCK_PHRASAL_EXERCISE.hint}
            </div>
          )}

          {showFeedback && (
            <div className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-4">
              <p className="mb-2 text-sm font-semibold text-amber-800">
                Attempt {attempt}: Not yet
              </p>
              <p className="text-sm text-slate-700">{MOCK_PHRASAL_EXERCISE.feedback}</p>
              {attempt === 1 ? (
                <button
                  type="button"
                  onClick={handleRetry}
                  className="mt-4 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
                >
                  Retry once
                </button>
              ) : (
                <div className="mt-3 rounded-lg bg-white p-3 text-sm text-slate-700">
                  <span className="font-medium">Correct example:</span>{' '}
                  {MOCK_PHRASAL_EXERCISE.correctExample}
                </div>
              )}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={() => setScreen('setup')}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Change saved verbs
            </button>
            <button
              type="button"
              onClick={startExercise}
              className={`rounded-lg px-5 py-2 text-sm font-semibold text-white ${styles.button}`}
            >
              New exercise
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={compact ? '' : 'mx-auto max-w-4xl'}>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className={`mb-4 text-sm ${styles.text} hover:underline`}
        >
          Back to modules
        </button>
      )}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <p className={`text-sm font-semibold ${styles.text}`}>Saved to your profile</p>
            <h2 className="text-xl font-bold text-slate-900">Choose phrasal verbs to practice</h2>
            <p className="mt-1 text-sm text-slate-600">
              These choices represent the persisted selection loaded in future sessions.
            </p>
          </div>

          <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <label className="min-w-0 flex-1 text-sm font-medium text-slate-700">
              Search phrasal verbs
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by verb, definition, or strength..."
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedIds(new Set(catalogVerbs.map((verb) => verb.id)))}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
              >
                Select all
              </button>
              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
              >
                Clear
              </button>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
                Auto-saved after every change
              </span>
              <button
                type="button"
                onClick={() => setAddingVerb((value) => !value)}
                className={`rounded-full px-3 py-1 text-xs font-medium text-white ${styles.button}`}
              >
                {addingVerb ? 'Cancel add' : 'Add phrasal verb'}
              </button>
            </div>
          </div>

          {addingVerb && (
            <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="grid gap-3 lg:grid-cols-[16rem_minmax(0,1fr)_auto] lg:items-end">
                <label className="text-sm font-medium text-slate-700">
                  Phrasal verb
                  <input
                    type="text"
                    value={newVerbText}
                    onChange={(event) => setNewVerbText(event.target.value)}
                    placeholder="e.g. carry on"
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Definition
                  <input
                    type="text"
                    value={newVerbDefinition}
                    onChange={(event) => setNewVerbDefinition(event.target.value)}
                    placeholder="Short meaning shown when expanded"
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
                <button
                  type="button"
                  onClick={addCustomVerb}
                  disabled={!newVerbText.trim() || !newVerbDefinition.trim()}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 ${styles.button}`}
                >
                  Add
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Sketch behavior: new catalog entries are added locally and selected automatically.
              </p>
            </div>
          )}

          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <span>
              Showing {filteredVerbs.length} of {catalogVerbs.length} phrasal verbs
            </span>
            <span>{selectedVerbs.length} selected</span>
          </div>

          <div className="max-h-[32rem] overflow-y-auto rounded-xl border border-slate-200 bg-white">
            {filteredVerbs.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-500">
                No phrasal verbs match your search.
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {filteredVerbs.map((verb) => {
                  const isSelected = selectedIds.has(verb.id)
                  const isExpanded = expandedDefinitionIds.has(verb.id)
                  return (
                    <li
                      key={verb.id}
                      className={`transition ${
                        isSelected ? styles.ring : 'border-transparent hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 px-3 py-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleVerb(verb)}
                          className="h-4 w-4 shrink-0 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          aria-label={`Select ${verb.text}`}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-slate-900">{verb.text}</p>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                              {verb.strength}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleDefinition(verb.id)}
                          className="shrink-0 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-white"
                          aria-expanded={isExpanded}
                        >
                          {isExpanded ? 'Hide' : 'Definition'}
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="border-t border-slate-100 bg-white/70 px-10 pb-3 pt-2 text-sm text-slate-600">
                          {verb.definition}
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900">Practice options</h3>
          <p className="mt-1 text-sm text-slate-600">
            Choose whether the generator uses all saved verbs or focuses on one.
          </p>

          <div className="mt-4 space-y-2">
            <label className="flex cursor-pointer gap-3 rounded-xl border border-slate-200 p-3 hover:bg-slate-50">
              <input
                type="radio"
                checked={practiceMode === 'all'}
                onChange={() => setPracticeMode('all')}
                className="mt-1"
              />
              <span>
                <span className="block text-sm font-medium text-slate-900">
                  Use all selected verbs
                </span>
                <span className="text-xs text-slate-500">Random rotation from saved list.</span>
              </span>
            </label>
            <label className="flex cursor-pointer gap-3 rounded-xl border border-slate-200 p-3 hover:bg-slate-50">
              <input
                type="radio"
                checked={practiceMode === 'one'}
                onChange={() => setPracticeMode('one')}
                className="mt-1"
              />
              <span>
                <span className="block text-sm font-medium text-slate-900">Use one verb only</span>
                <span className="text-xs text-slate-500">Focused drill for weak verbs.</span>
              </span>
            </label>
          </div>

          {practiceMode === 'one' && (
            <label className="mt-4 block text-sm font-medium text-slate-700">
              Focus verb
              <select
                value={focusVerbId}
                onChange={(event) => setFocusVerbId(event.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                {selectedVerbs.map((verb) => (
                  <option key={verb.id} value={verb.id}>
                    {verb.text}
                  </option>
                ))}
              </select>
            </label>
          )}

          <div className={`mt-5 rounded-xl border p-3 text-sm ${styles.soft}`}>
            <p className="font-medium">{selectedVerbs.length} verbs selected</p>
            <p className="mt-1 opacity-80">
              This list is visible only before practice starts.
            </p>
          </div>

          <button
            type="button"
            onClick={startExercise}
            disabled={selectedVerbs.length === 0}
            className={`mt-5 w-full rounded-lg px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 ${styles.button}`}
          >
            Start practice
          </button>
        </aside>
      </div>
    </section>
  )
}
