import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import {
  MOCK_GERMAN_NOUNS,
  MOCK_GERMAN_VERBS,
  MOCK_PREPOSITION_TERMS,
  type SketchGermanNoun,
  type SketchGermanVerb,
  type SketchPracticeTerm,
} from '../mockData'

type Accent = 'teal' | 'indigo' | 'blue'

type ExerciseProposalProps = {
  accent: Accent
  compact?: boolean
  onBack?: () => void
}

const ACCENTS = {
  teal: {
    text: 'text-teal-700',
    button: 'bg-teal-600 hover:bg-teal-700',
    soft: 'border-teal-100 bg-teal-50 text-teal-900',
    selected: 'border-teal-400 bg-teal-50',
  },
  indigo: {
    text: 'text-indigo-700',
    button: 'bg-indigo-600 hover:bg-indigo-700',
    soft: 'border-indigo-100 bg-indigo-50 text-indigo-900',
    selected: 'border-indigo-400 bg-indigo-50',
  },
  blue: {
    text: 'text-blue-700',
    button: 'bg-blue-600 hover:bg-blue-700',
    soft: 'border-blue-100 bg-blue-50 text-blue-900',
    selected: 'border-blue-400 bg-blue-50',
  },
} as const

export function PrepositionsPracticeProposal({ accent, compact = false, onBack }: ExerciseProposalProps) {
  const styles = ACCENTS[accent]
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(['in', 'on', 'at']))
  const [mode, setMode] = useState<'single' | 'mixed'>('mixed')
  const [screen, setScreen] = useState<'setup' | 'exercise'>('setup')
  const [answer, setAnswer] = useState('')
  const [showHint, setShowHint] = useState(false)
  const [feedbackVisible, setFeedbackVisible] = useState(false)

  const selectedTerms = useMemo(
    () => MOCK_PREPOSITION_TERMS.filter((term) => selectedIds.has(term.id)),
    [selectedIds],
  )

  const toggleTerm = (term: SketchPracticeTerm) => {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(term.id)) next.delete(term.id)
      else next.add(term.id)
      return next
    })
  }

  if (screen === 'exercise') {
    return (
      <ProposalFrame
        title="Prepositions practice"
        subtitle="Best approach: setup first, then hide the selected term list during the exercise."
        styles={styles}
        onBack={onBack}
      >
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          The term list is hidden while answering. In mixed mode, a hint can reveal only the needed
          prepositions, matching the current multi-preposition behavior.
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className={`text-sm font-semibold ${styles.text}`}>
              {mode === 'mixed' ? 'Mixed sentence translation' : 'Single preposition drill'}
            </p>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
              Attempt 1 of 2
            </span>
          </div>
          <div className={`rounded-xl border p-4 ${styles.soft}`}>
            <p className="text-xs font-semibold uppercase tracking-wide opacity-70">Prompt</p>
            <p className="mt-1 text-lg font-medium">
              Translate: El libro esta en la mesa junto a la ventana.
            </p>
          </div>
          {showHint && (
            <div className="mt-3 flex flex-wrap gap-2 rounded-xl border border-sky-200 bg-sky-50 p-3">
              {(mode === 'mixed' ? ['on', 'by / next to'] : ['on']).map((hint) => (
                <span key={hint} className="rounded-full bg-white px-3 py-1 text-sm text-sky-900">
                  {hint}
                </span>
              ))}
            </div>
          )}
          <textarea
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            rows={compact ? 3 : 4}
            placeholder="Type your English translation..."
            className="mt-4 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={() => setShowHint((value) => !value)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              {showHint ? 'Hide hint' : 'Show hint'}
            </button>
            <button
              type="button"
              onClick={() => setFeedbackVisible(true)}
              className={`rounded-lg px-5 py-2 text-sm font-semibold text-white ${styles.button}`}
            >
              Check
            </button>
          </div>
          {feedbackVisible && (
            <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-slate-700">
              <p className="font-semibold text-amber-800">Not yet</p>
              <p className="mt-1">
                Good structure. Use <strong>on</strong> for the table surface and keep the location
                phrase near the end of the sentence.
              </p>
              <button
                type="button"
                className="mt-3 rounded-lg bg-slate-800 px-4 py-2 text-sm text-white"
              >
                Retry once
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={() => setScreen('setup')}
            className="mt-5 text-sm text-slate-600 underline"
          >
            Change saved terms
          </button>
        </div>
      </ProposalFrame>
    )
  }

  return (
    <ProposalFrame
      title="Prepositions practice"
      subtitle="Best approach: keep saved term selection, then let the learner choose single-term or mixed-sentence practice."
      styles={styles}
      onBack={onBack}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className={`text-sm font-semibold ${styles.text}`}>Saved terms</p>
          <h3 className="text-xl font-bold text-slate-900">Choose what to practice</h3>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {MOCK_PREPOSITION_TERMS.map((term) => {
              const selected = selectedIds.has(term.id)
              return (
                <button
                  key={term.id}
                  type="button"
                  onClick={() => toggleTerm(term)}
                  className={`rounded-xl border p-4 text-left ${selected ? styles.selected : 'border-slate-200'}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-slate-900">{term.term}</p>
                    <span className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-500">
                      {term.type}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{term.definition}</p>
                </button>
              )
            })}
          </div>
        </div>
        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900">Practice mode</h3>
          <div className="mt-4 space-y-2">
            <ModeOption
              label="Single term"
              detail="Best for learning the meaning and common use of one preposition."
              checked={mode === 'single'}
              onChange={() => setMode('single')}
            />
            <ModeOption
              label="Mixed sentence"
              detail="Best for real translation practice and multiple prepositions."
              checked={mode === 'mixed'}
              onChange={() => setMode('mixed')}
            />
          </div>
          <p className={`mt-4 rounded-xl border p-3 text-sm ${styles.soft}`}>
            {selectedTerms.length} saved terms. Selection remains available next session.
          </p>
          <button
            type="button"
            onClick={() => setScreen('exercise')}
            className={`mt-4 w-full rounded-lg px-5 py-3 text-sm font-semibold text-white ${styles.button}`}
          >
            Start practice
          </button>
        </aside>
      </div>
    </ProposalFrame>
  )
}

export function ChatPracticeProposal({ accent, onBack }: ExerciseProposalProps) {
  const styles = ACCENTS[accent]
  const [feedbackOpen, setFeedbackOpen] = useState(true)

  return (
    <ProposalFrame
      title="Chat Practice"
      subtitle="Best approach: scenario cards before chat, then a responsive feedback drawer instead of a fixed desktop-only panel."
      styles={styles}
      onBack={onBack}
    >
      <div className="grid gap-4 lg:grid-cols-[16rem_minmax(0,1fr)_18rem]">
        <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="font-semibold text-slate-900">Sessions</h3>
          {['Restaurant small talk', 'Job interview', 'Travel problem'].map((session, index) => (
            <button
              key={session}
              type="button"
              className={`mt-3 block w-full rounded-xl border p-3 text-left text-sm ${
                index === 0 ? styles.selected : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="font-medium text-slate-900">{session}</span>
              <span className="mt-1 block text-xs text-slate-500">Goal + latest feedback saved</span>
            </button>
          ))}
          <button
            type="button"
            className={`mt-4 w-full rounded-lg px-4 py-2 text-sm font-semibold text-white ${styles.button}`}
          >
            New guided chat
          </button>
        </aside>

        <section className="flex min-h-[28rem] flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className={`border-b p-4 ${styles.soft}`}>
            <p className="text-sm font-semibold">Restaurant small talk</p>
            <p className="text-xs opacity-80">Goal: order politely and ask one follow-up question.</p>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            <ChatBubble side="left">Welcome! What would you like to order today?</ChatBubble>
            <ChatBubble side="right">I want a coffee and sandwich, please.</ChatBubble>
            <ChatBubble side="left">Sure. Would you like anything else?</ChatBubble>
          </div>
          <div className="border-t border-slate-200 p-3">
            <textarea
              rows={2}
              placeholder="Type your message... Enter to send"
              className="block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            />
            <div className="mt-2 flex justify-between gap-2">
              <button
                type="button"
                onClick={() => setFeedbackOpen((value) => !value)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 lg:hidden"
              >
                {feedbackOpen ? 'Hide feedback' : 'Show feedback'}
              </button>
              <button
                type="button"
                className={`ml-auto rounded-lg px-5 py-2 text-sm font-semibold text-white ${styles.button}`}
              >
                Send
              </button>
            </div>
          </div>
        </section>

        <aside
          className={`rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm ${feedbackOpen ? 'block' : 'hidden lg:block'}`}
        >
          <h3 className="font-semibold text-slate-900">Feedback</h3>
          <div className="mt-4 rounded-xl border border-red-100 bg-white p-3 text-sm">
            <p className="text-xs font-semibold uppercase text-red-600">Correction</p>
            <p className="mt-1 text-slate-500 line-through">I want a coffee...</p>
            <p className="font-medium text-slate-900">I would like a coffee...</p>
          </div>
          <div className="mt-3 rounded-xl border border-indigo-100 bg-white p-3 text-sm">
            <p className={`text-xs font-semibold uppercase ${styles.text}`}>Suggestion</p>
            <p className="mt-1 text-slate-700">Ask: “Could you recommend a dessert?”</p>
          </div>
        </aside>
      </div>
    </ProposalFrame>
  )
}

export function GermanNounsPracticeProposal({ accent, compact = false, onBack }: ExerciseProposalProps) {
  const styles = ACCENTS[accent]
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(['tisch', 'blume', 'buch']))
  const [showAnswer, setShowAnswer] = useState(false)
  const selectedNouns = MOCK_GERMAN_NOUNS.filter((noun) => selectedIds.has(noun.id))

  const toggleNoun = (noun: SketchGermanNoun) => {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(noun.id)) next.delete(noun.id)
      else next.add(noun.id)
      return next
    })
  }

  return (
    <ProposalFrame
      title="German Nouns"
      subtitle="Best approach: article + plural selection first, then case-based sentence drills with the noun list hidden."
      styles={styles}
      onBack={onBack}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className={`text-sm font-semibold ${styles.text}`}>Saved noun set</p>
          <h3 className="text-xl font-bold text-slate-900">Choose nouns by gender and case focus</h3>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {MOCK_GERMAN_NOUNS.map((noun) => {
              const selected = selectedIds.has(noun.id)
              return (
                <button
                  key={noun.id}
                  type="button"
                  onClick={() => toggleNoun(noun)}
                  className={`rounded-xl border p-4 text-left ${selected ? styles.selected : 'border-slate-200'}`}
                >
                  <p className="text-lg font-bold text-slate-900">
                    {noun.article} {noun.noun}
                  </p>
                  <p className="text-sm text-slate-500">{noun.meaning}</p>
                  <p className="mt-2 text-xs text-slate-400">Plural: {noun.plural}</p>
                  <span className="mt-3 inline-block rounded-full bg-white px-2 py-0.5 text-xs text-slate-500">
                    {noun.caseFocus}
                  </span>
                </button>
              )
            })}
          </div>
        </section>
        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900">Exercise preview</h3>
          <p className={`mt-2 rounded-xl border p-3 text-sm ${styles.soft}`}>
            {selectedNouns.length} nouns saved. During practice, the article list is hidden to avoid
            giving away gender.
          </p>
          <div className="mt-4 rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Fill article + noun
            </p>
            <p className="mt-2 text-lg font-medium text-slate-900">
              Ich sehe ___ ___ auf dem Tisch.
            </p>
            <input
              placeholder={compact ? 'den Tisch' : 'Type: article + noun'}
              className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => setShowAnswer(true)}
              className={`mt-3 rounded-lg px-4 py-2 text-sm font-semibold text-white ${styles.button}`}
            >
              Check
            </button>
            {showAnswer && (
              <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                Correct: <strong>den Tisch</strong>. Accusative masculine changes der to den.
              </p>
            )}
          </div>
        </aside>
      </div>
    </ProposalFrame>
  )
}

export function GermanVerbsPracticeProposal({ accent, compact = false, onBack }: ExerciseProposalProps) {
  const styles = ACCENTS[accent]
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(['gehen', 'machen', 'sein']))
  const [showTable, setShowTable] = useState(false)
  const selectedVerbs = MOCK_GERMAN_VERBS.filter((verb) => selectedIds.has(verb.id))

  const toggleVerb = (verb: SketchGermanVerb) => {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(verb.id)) next.delete(verb.id)
      else next.add(verb.id)
      return next
    })
  }

  return (
    <ProposalFrame
      title="German Verbs"
      subtitle="Best approach: filter by tense/person before practice, then hide the conjugation table until feedback."
      styles={styles}
      onBack={onBack}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className={`text-sm font-semibold ${styles.text}`}>Catalog-backed selection</p>
          <h3 className="text-xl font-bold text-slate-900">Choose verbs and conjugation focus</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {MOCK_GERMAN_VERBS.map((verb) => {
              const selected = selectedIds.has(verb.id)
              return (
                <button
                  key={verb.id}
                  type="button"
                  onClick={() => toggleVerb(verb)}
                  className={`rounded-xl border p-4 text-left ${selected ? styles.selected : 'border-slate-200'}`}
                >
                  <p className="text-lg font-bold text-slate-900">{verb.infinitive}</p>
                  <p className="text-sm text-slate-500">{verb.meaning}</p>
                  <p className="mt-2 text-xs text-slate-400">{verb.sample}</p>
                  <span className="mt-3 inline-block rounded-full bg-white px-2 py-0.5 text-xs text-slate-500">
                    {verb.weakOrStrong}
                  </span>
                </button>
              )
            })}
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {['Present', 'Past', 'Future'].map((tense) => (
              <label key={tense} className="rounded-xl border border-slate-200 p-3 text-sm">
                <input type="checkbox" defaultChecked={tense === 'Present'} className="mr-2" />
                {tense}
              </label>
            ))}
          </div>
        </section>
        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900">Exercise preview</h3>
          <p className={`mt-2 rounded-xl border p-3 text-sm ${styles.soft}`}>
            {selectedVerbs.length} verbs selected. Conjugation table stays hidden during answer.
          </p>
          <div className="mt-4 rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Conjugate
            </p>
            <p className="mt-2 text-lg font-medium text-slate-900">gehen · present · 1sg</p>
            <input
              placeholder={compact ? 'ich gehe' : 'Type the conjugated form'}
              className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${styles.button}`}
              >
                Check
              </button>
              <button
                type="button"
                onClick={() => setShowTable((value) => !value)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700"
              >
                {showTable ? 'Hide table' : 'Reveal after answer'}
              </button>
            </div>
            {showTable && (
              <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-700">
                ich gehe · du gehst · er geht · wir gehen · ihr geht · sie gehen
              </div>
            )}
          </div>
        </aside>
      </div>
    </ProposalFrame>
  )
}

function ProposalFrame({
  title,
  subtitle,
  styles,
  onBack,
  children,
}: {
  title: string
  subtitle: string
  styles: (typeof ACCENTS)[Accent]
  onBack?: () => void
  children: ReactNode
}) {
  return (
    <section>
      {onBack && (
        <button type="button" onClick={onBack} className={`mb-4 text-sm ${styles.text} hover:underline`}>
          Back to modules
        </button>
      )}
      <div className="mb-5">
        <p className={`text-sm font-semibold ${styles.text}`}>Exercise proposal</p>
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">{subtitle}</p>
      </div>
      {children}
    </section>
  )
}

function ModeOption({
  label,
  detail,
  checked,
  onChange,
}: {
  label: string
  detail: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <label className="flex cursor-pointer gap-3 rounded-xl border border-slate-200 p-3 hover:bg-slate-50">
      <input type="radio" checked={checked} onChange={onChange} className="mt-1" />
      <span>
        <span className="block text-sm font-medium text-slate-900">{label}</span>
        <span className="text-xs text-slate-500">{detail}</span>
      </span>
    </label>
  )
}

function ChatBubble({ side, children }: { side: 'left' | 'right'; children: ReactNode }) {
  return (
    <div className={`flex ${side === 'right' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm ${
          side === 'right' ? 'bg-indigo-600 text-white' : 'border border-slate-200 bg-slate-50 text-slate-800'
        }`}
      >
        {children}
      </div>
    </div>
  )
}
