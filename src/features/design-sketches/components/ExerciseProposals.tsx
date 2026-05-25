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

function getGermanCaseLabel(caseFocus: SketchGermanNoun['caseFocus']) {
  switch (caseFocus) {
    case 'Nominative':
      return 'Nominativ'
    case 'Accusative':
      return 'Akkusativ'
    case 'Dative':
      return 'Dativ'
  }
}

function getGermanTenseLabel(tense: SketchGermanVerb['tense']) {
  switch (tense) {
    case 'Present':
      return 'Präsens'
    case 'Past':
      return 'Präteritum'
    case 'Future':
      return 'Futur'
  }
}

function getGermanVerbTypeLabel(type: SketchGermanVerb['weakOrStrong']) {
  switch (type) {
    case 'Weak':
      return 'Schwach'
    case 'Strong':
      return 'Stark'
    case 'Mixed':
      return 'Gemischt'
  }
}

export function PrepositionsPracticeProposal({ accent, compact = false, onBack }: ExerciseProposalProps) {
  const styles = ACCENTS[accent]
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(['in', 'on', 'at']))
  const [mode, setMode] = useState<'single' | 'mixed'>('mixed')
  const [screen, setScreen] = useState<'setup' | 'exercise'>('setup')
  const [answer, setAnswer] = useState('')
  const [showHint, setShowHint] = useState(false)
  const [feedbackVisible, setFeedbackVisible] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedDefinitionIds, setExpandedDefinitionIds] = useState<Set<string>>(new Set())
  const [customTerms, setCustomTerms] = useState<SketchPracticeTerm[]>([])
  const [addingTerm, setAddingTerm] = useState(false)
  const [newTerm, setNewTerm] = useState('')
  const [newDefinition, setNewDefinition] = useState('')

  const catalogTerms = useMemo(
    () => [...MOCK_PREPOSITION_TERMS, ...customTerms],
    [customTerms],
  )

  const selectedTerms = useMemo(
    () => catalogTerms.filter((term) => selectedIds.has(term.id)),
    [catalogTerms, selectedIds],
  )

  const filteredTerms = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()
    if (!normalizedSearch) return catalogTerms

    return catalogTerms.filter((term) =>
      [term.term, term.definition, term.type].some((value) =>
        value.toLowerCase().includes(normalizedSearch),
      ),
    )
  }, [catalogTerms, searchTerm])

  const toggleTerm = (term: SketchPracticeTerm) => {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(term.id)) next.delete(term.id)
      else next.add(term.id)
      return next
    })
  }

  const toggleDefinition = (termId: string) => {
    setExpandedDefinitionIds((current) => {
      const next = new Set(current)
      if (next.has(termId)) next.delete(termId)
      else next.add(termId)
      return next
    })
  }

  const addCustomTerm = () => {
    const term = newTerm.trim().toLowerCase()
    const definition = newDefinition.trim()
    if (!term || !definition) return

    const id = `custom-${term.replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`
    const createdTerm: SketchPracticeTerm = {
      id,
      term,
      type: 'single',
      definition,
      examples: [],
    }

    setCustomTerms((current) => [...current, createdTerm])
    setSelectedIds((current) => new Set(current).add(id))
    setNewTerm('')
    setNewDefinition('')
    setAddingTerm(false)
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

          <div className="mt-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <label className="min-w-0 flex-1 text-sm font-medium text-slate-700">
              Search prepositions or terms
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by term, definition, or type..."
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedIds(new Set(catalogTerms.map((term) => term.id)))}
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
              <button
                type="button"
                onClick={() => setAddingTerm((value) => !value)}
                className={`rounded-full px-3 py-1 text-xs font-medium text-white ${styles.button}`}
              >
                {addingTerm ? 'Cancel add' : 'Add term'}
              </button>
            </div>
          </div>

          {addingTerm && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="grid gap-3 lg:grid-cols-[14rem_minmax(0,1fr)_auto] lg:items-end">
                <label className="text-sm font-medium text-slate-700">
                  Term
                  <input
                    type="text"
                    value={newTerm}
                    onChange={(event) => setNewTerm(event.target.value)}
                    placeholder="e.g. across"
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Definition
                  <input
                    type="text"
                    value={newDefinition}
                    onChange={(event) => setNewDefinition(event.target.value)}
                    placeholder="Short meaning shown when expanded"
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
                <button
                  type="button"
                  onClick={addCustomTerm}
                  disabled={!newTerm.trim() || !newDefinition.trim()}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 ${styles.button}`}
                >
                  Add
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Sketch behavior: new catalog terms are added locally and selected automatically.
              </p>
            </div>
          )}

          <div className="mb-3 mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <span>
              Showing {filteredTerms.length} of {catalogTerms.length} terms
            </span>
            <span>{selectedTerms.length} selected</span>
          </div>

          <div className="max-h-[32rem] overflow-y-auto rounded-xl border border-slate-200 bg-white">
            {filteredTerms.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-500">
                No terms match your search.
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {filteredTerms.map((term) => {
                  const selected = selectedIds.has(term.id)
                  const expanded = expandedDefinitionIds.has(term.id)
                  return (
                    <li
                      key={term.id}
                      className={`transition ${
                        selected ? styles.selected : 'border-transparent hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 px-3 py-2">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleTerm(term)}
                          className="h-4 w-4 shrink-0 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          aria-label={`Select ${term.term}`}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-slate-900">{term.term}</p>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                              {term.type}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleDefinition(term.id)}
                          className="shrink-0 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-white"
                          aria-expanded={expanded}
                        >
                          {expanded ? 'Hide' : 'Definition'}
                        </button>
                      </div>

                      {expanded && (
                        <div className="border-t border-slate-100 bg-white/70 px-10 pb-3 pt-2 text-sm text-slate-600">
                          {term.definition}
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
  const [screen, setScreen] = useState<'setup' | 'exercise'>('setup')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [showAnswer, setShowAnswer] = useState(false)
  const [customNouns, setCustomNouns] = useState<SketchGermanNoun[]>([])
  const [addingNoun, setAddingNoun] = useState(false)
  const [newNoun, setNewNoun] = useState('')
  const [newArticle, setNewArticle] = useState<SketchGermanNoun['article']>('der')
  const [newPlural, setNewPlural] = useState('')
  const [newMeaning, setNewMeaning] = useState('')
  const [newCaseFocus, setNewCaseFocus] = useState<SketchGermanNoun['caseFocus']>('Nominative')
  const catalogNouns = useMemo(
    () => [...MOCK_GERMAN_NOUNS, ...customNouns],
    [customNouns],
  )
  const selectedNouns = useMemo(
    () => catalogNouns.filter((noun) => selectedIds.has(noun.id)),
    [catalogNouns, selectedIds],
  )
  const filteredNouns = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()
    if (!normalizedSearch) return catalogNouns

    return catalogNouns.filter((noun) =>
      [noun.noun, noun.article, noun.plural, noun.meaning, noun.caseFocus].some((value) =>
        value.toLowerCase().includes(normalizedSearch),
      ),
    )
  }, [catalogNouns, searchTerm])

  const toggleNoun = (noun: SketchGermanNoun) => {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(noun.id)) next.delete(noun.id)
      else next.add(noun.id)
      return next
    })
  }

  const toggleExpanded = (nounId: string) => {
    setExpandedIds((current) => {
      const next = new Set(current)
      if (next.has(nounId)) next.delete(nounId)
      else next.add(nounId)
      return next
    })
  }

  const addCustomNoun = () => {
    const noun = newNoun.trim()
    const plural = newPlural.trim()
    const meaning = newMeaning.trim()
    if (!noun || !plural || !meaning) return

    const id = `custom-${noun.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`
    const createdNoun: SketchGermanNoun = {
      id,
      noun,
      article: newArticle,
      plural,
      meaning,
      caseFocus: newCaseFocus,
    }

    setCustomNouns((current) => [...current, createdNoun])
    setSelectedIds((current) => new Set(current).add(id))
    setNewNoun('')
    setNewPlural('')
    setNewMeaning('')
    setNewArticle('der')
    setNewCaseFocus('Nominative')
    setAddingNoun(false)
  }

  if (screen === 'exercise') {
    return (
      <ProposalFrame
        title="Deutsche Nomen"
        subtitle="Übungsansicht: Die ausgewählte Nomenliste bleibt verborgen, während Artikel, Genus, Plural und Kasus geübt werden."
        styles={styles}
        onBack={onBack}
        eyebrow="Übungsvorschlag"
        backLabel="Zurück zu den Modulen"
      >
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Die Nomenliste ist während der Übung ausgeblendet, damit Artikel und Genus nicht sichtbar sind.
        </div>
        <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className={`text-sm font-semibold ${styles.text}`}>Übung: Deutsche Nomen</p>
              <h3 className="text-xl font-bold text-slate-900">Artikel + Nomen ergänzen</h3>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
              {selectedNouns.length} gespeicherte Nomen in der Rotation
            </span>
          </div>
          <div className={`rounded-xl border p-4 ${styles.soft}`}>
            <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
              Deutscher Satz
            </p>
            <p className="mt-1 text-lg font-medium">Ich sehe ___ ___ auf dem Tisch.</p>
            <p className="mt-3 text-sm opacity-80">
              Erwartetes Nomen auf Spanisch: <span className="font-semibold">mesa</span>
            </p>
          </div>
          <input
            placeholder={compact ? 'den Tisch' : 'Artikel + Nomen eingeben'}
            className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={() => setScreen('setup')}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Gespeicherte Nomen ändern
            </button>
            <button
              type="button"
              onClick={() => setShowAnswer(true)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${styles.button}`}
            >
              Prüfen
            </button>
          </div>
          {showAnswer && (
            <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
              Richtig: <strong>den Tisch</strong>. Im Akkusativ wird der maskuline Artikel der zu den.
            </p>
          )}
        </div>
      </ProposalFrame>
    )
  }

  return (
    <ProposalFrame
      title="Deutsche Nomen"
      subtitle="Vorschlag: Zuerst Artikel und Plural auswählen, danach satzbasierte Kasusübungen mit ausgeblendeter Nomenliste."
      styles={styles}
      onBack={onBack}
      eyebrow="Übungsvorschlag"
      backLabel="Zurück zu den Modulen"
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className={`text-sm font-semibold ${styles.text}`}>Gespeicherte Nomen</p>
          <h3 className="text-xl font-bold text-slate-900">Nomen nach Genus und Kasusfokus auswählen</h3>
          <div className="mt-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <label className="min-w-0 flex-1 text-sm font-medium text-slate-700">
              Nomen suchen
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Nach Nomen, Artikel, Plural, Bedeutung oder Kasus suchen..."
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedIds(new Set(catalogNouns.map((noun) => noun.id)))}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
              >
                Alle auswählen
              </button>
              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
              >
                Leeren
              </button>
              <button
                type="button"
                onClick={() => setAddingNoun((value) => !value)}
                className={`rounded-full px-3 py-1 text-xs font-medium text-white ${styles.button}`}
              >
                {addingNoun ? 'Hinzufügen abbrechen' : 'Nomen hinzufügen'}
              </button>
            </div>
          </div>
          {addingNoun && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="grid gap-3 lg:grid-cols-[7rem_14rem_14rem_minmax(0,1fr)_10rem_auto] lg:items-end">
                <label className="text-sm font-medium text-slate-700">
                  Artikel
                  <select
                    value={newArticle}
                    onChange={(event) => setNewArticle(event.target.value as SketchGermanNoun['article'])}
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="der">der</option>
                    <option value="die">die</option>
                    <option value="das">das</option>
                  </select>
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Nomen
                  <input
                    type="text"
                    value={newNoun}
                    onChange={(event) => setNewNoun(event.target.value)}
                    placeholder="z. B. Hund"
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Plural
                  <input
                    type="text"
                    value={newPlural}
                    onChange={(event) => setNewPlural(event.target.value)}
                    placeholder="z. B. Hunde"
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Bedeutung
                  <input
                    type="text"
                    value={newMeaning}
                    onChange={(event) => setNewMeaning(event.target.value)}
                    placeholder="Bedeutung auf Englisch"
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Kasusfokus
                  <select
                    value={newCaseFocus}
                    onChange={(event) => setNewCaseFocus(event.target.value as SketchGermanNoun['caseFocus'])}
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="Nominative">Nominativ</option>
                    <option value="Accusative">Akkusativ</option>
                    <option value="Dative">Dativ</option>
                  </select>
                </label>
                <button
                  type="button"
                  onClick={addCustomNoun}
                  disabled={!newNoun.trim() || !newPlural.trim() || !newMeaning.trim()}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 ${styles.button}`}
                >
                  Hinzufügen
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Skizzenverhalten: Neue Nomen werden lokal hinzugefügt und automatisch ausgewählt.
              </p>
            </div>
          )}
          <div className="mb-3 mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <span>
              {filteredNouns.length} von {catalogNouns.length} Nomen werden angezeigt
            </span>
            <span>{selectedNouns.length} ausgewählt</span>
          </div>
          <div className="max-h-[32rem] overflow-y-auto rounded-xl border border-slate-200 bg-white">
            {filteredNouns.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-500">
                Keine Nomen passen zu deiner Suche.
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {filteredNouns.map((noun) => {
                  const selected = selectedIds.has(noun.id)
                  const expanded = expandedIds.has(noun.id)
                  return (
                    <li
                      key={noun.id}
                      className={`transition ${
                        selected ? styles.selected : 'border-transparent hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 px-3 py-2">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleNoun(noun)}
                          className="h-4 w-4 shrink-0 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          aria-label={`${noun.noun} auswählen`}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-slate-900">
                              {noun.article} {noun.noun}
                            </p>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                              {getGermanCaseLabel(noun.caseFocus)}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleExpanded(noun.id)}
                          className="shrink-0 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-white"
                          aria-expanded={expanded}
                        >
                          {expanded ? 'Ausblenden' : 'Details'}
                        </button>
                      </div>
                      {expanded && (
                        <div className="border-t border-slate-100 bg-white/70 px-10 pb-3 pt-2 text-sm text-slate-600">
                          <p>Bedeutung: {noun.meaning}</p>
                          <p>Plural: {noun.plural}</p>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </section>
        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900">Übungsoptionen</h3>
          <p className={`mt-2 rounded-xl border p-3 text-sm ${styles.soft}`}>
            {selectedNouns.length} Nomen gespeichert. Während der Übung bleibt die Artikelliste ausgeblendet.
          </p>
          <button
            type="button"
            onClick={() => {
              setShowAnswer(false)
              setScreen('exercise')
            }}
            disabled={selectedNouns.length === 0}
            className={`mt-4 w-full rounded-lg px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 ${styles.button}`}
          >
            Übung starten
          </button>
        </aside>
      </div>
    </ProposalFrame>
  )
}

export function GermanVerbsPracticeProposal({ accent, compact = false, onBack }: ExerciseProposalProps) {
  const styles = ACCENTS[accent]
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(['gehen', 'machen', 'sein']))
  const [screen, setScreen] = useState<'setup' | 'exercise'>('setup')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [showTable, setShowTable] = useState(false)
  const [customVerbs, setCustomVerbs] = useState<SketchGermanVerb[]>([])
  const [addingVerb, setAddingVerb] = useState(false)
  const [newInfinitive, setNewInfinitive] = useState('')
  const [newVerbMeaning, setNewVerbMeaning] = useState('')
  const [newVerbSample, setNewVerbSample] = useState('')
  const [newVerbTense, setNewVerbTense] = useState<SketchGermanVerb['tense']>('Present')
  const [newVerbType, setNewVerbType] = useState<SketchGermanVerb['weakOrStrong']>('Weak')
  const catalogVerbs = useMemo(
    () => [...MOCK_GERMAN_VERBS, ...customVerbs],
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
      [verb.infinitive, verb.meaning, verb.tense, verb.weakOrStrong, verb.sample].some((value) =>
        value.toLowerCase().includes(normalizedSearch),
      ),
    )
  }, [catalogVerbs, searchTerm])

  const toggleVerb = (verb: SketchGermanVerb) => {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(verb.id)) next.delete(verb.id)
      else next.add(verb.id)
      return next
    })
  }

  const toggleExpanded = (verbId: string) => {
    setExpandedIds((current) => {
      const next = new Set(current)
      if (next.has(verbId)) next.delete(verbId)
      else next.add(verbId)
      return next
    })
  }

  const addCustomVerb = () => {
    const infinitive = newInfinitive.trim().toLowerCase()
    const meaning = newVerbMeaning.trim()
    const sample = newVerbSample.trim()
    if (!infinitive || !meaning || !sample) return

    const id = `custom-${infinitive.replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`
    const createdVerb: SketchGermanVerb = {
      id,
      infinitive,
      meaning,
      tense: newVerbTense,
      weakOrStrong: newVerbType,
      sample,
    }

    setCustomVerbs((current) => [...current, createdVerb])
    setSelectedIds((current) => new Set(current).add(id))
    setNewInfinitive('')
    setNewVerbMeaning('')
    setNewVerbSample('')
    setNewVerbTense('Present')
    setNewVerbType('Weak')
    setAddingVerb(false)
  }

  if (screen === 'exercise') {
    return (
      <ProposalFrame
        title="Deutsche Verben"
        subtitle="Übungsansicht: Die ausgewählte Verbenliste und die Konjugationstabelle bleiben bis zum Feedback oder Aufdecken verborgen."
        styles={styles}
        onBack={onBack}
        eyebrow="Übungsvorschlag"
        backLabel="Zurück zu den Modulen"
      >
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Die ausgewählte Verbenliste ist während der Übung ausgeblendet. Die Konjugationstabelle ist erst
          nach der Antwort oder nach manuellem Aufdecken verfügbar.
        </div>
        <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className={`text-sm font-semibold ${styles.text}`}>Übung: Deutsche Verben</p>
              <h3 className="text-xl font-bold text-slate-900">Verb konjugieren</h3>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
              {selectedVerbs.length} gespeicherte Verben in der Rotation
            </span>
          </div>
          <div className={`rounded-xl border p-4 ${styles.soft}`}>
            <p className="text-xs font-semibold uppercase tracking-wide opacity-70">Aufgabe</p>
            <p className="mt-1 text-lg font-medium">gehen · Präsens · 1. Person Singular</p>
          </div>
          <input
            placeholder={compact ? 'ich gehe' : 'Konjugierte Form eingeben'}
            className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={() => setScreen('setup')}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Gespeicherte Verben ändern
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${styles.button}`}
              >
                Prüfen
              </button>
              <button
                type="button"
                onClick={() => setShowTable((value) => !value)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700"
              >
                {showTable ? 'Tabelle ausblenden' : 'Nach Antwort aufdecken'}
              </button>
            </div>
          </div>
          {showTable && (
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              ich gehe · du gehst · er geht · wir gehen · ihr geht · sie gehen
            </div>
          )}
        </div>
      </ProposalFrame>
    )
  }

  return (
    <ProposalFrame
      title="Deutsche Verben"
      subtitle="Vorschlag: Vor der Übung nach Zeitform und Person filtern, danach die Konjugationstabelle bis zum Feedback ausblenden."
      styles={styles}
      onBack={onBack}
      eyebrow="Übungsvorschlag"
      backLabel="Zurück zu den Modulen"
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className={`text-sm font-semibold ${styles.text}`}>Katalogauswahl</p>
          <h3 className="text-xl font-bold text-slate-900">Verben und Konjugationsfokus auswählen</h3>
          <div className="mt-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <label className="min-w-0 flex-1 text-sm font-medium text-slate-700">
              Verben suchen
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Nach Infinitiv, Bedeutung, Zeitform, Typ oder Beispiel suchen..."
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedIds(new Set(catalogVerbs.map((verb) => verb.id)))}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
              >
                Alle auswählen
              </button>
              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
              >
                Leeren
              </button>
              <button
                type="button"
                onClick={() => setAddingVerb((value) => !value)}
                className={`rounded-full px-3 py-1 text-xs font-medium text-white ${styles.button}`}
              >
                {addingVerb ? 'Hinzufügen abbrechen' : 'Verb hinzufügen'}
              </button>
            </div>
          </div>
          {addingVerb && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="grid gap-3 lg:grid-cols-[12rem_minmax(0,1fr)_12rem_10rem_10rem_auto] lg:items-end">
                <label className="text-sm font-medium text-slate-700">
                  Infinitiv
                  <input
                    type="text"
                    value={newInfinitive}
                    onChange={(event) => setNewInfinitive(event.target.value)}
                    placeholder="z. B. lernen"
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Bedeutung
                  <input
                    type="text"
                    value={newVerbMeaning}
                    onChange={(event) => setNewVerbMeaning(event.target.value)}
                    placeholder="Bedeutung auf Englisch"
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Beispiel
                  <input
                    type="text"
                    value={newVerbSample}
                    onChange={(event) => setNewVerbSample(event.target.value)}
                    placeholder="ich lerne"
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Zeitform
                  <select
                    value={newVerbTense}
                    onChange={(event) => setNewVerbTense(event.target.value as SketchGermanVerb['tense'])}
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="Present">Präsens</option>
                    <option value="Past">Präteritum</option>
                    <option value="Future">Futur</option>
                  </select>
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Typ
                  <select
                    value={newVerbType}
                    onChange={(event) => setNewVerbType(event.target.value as SketchGermanVerb['weakOrStrong'])}
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="Weak">Schwach</option>
                    <option value="Strong">Stark</option>
                    <option value="Mixed">Gemischt</option>
                  </select>
                </label>
                <button
                  type="button"
                  onClick={addCustomVerb}
                  disabled={!newInfinitive.trim() || !newVerbMeaning.trim() || !newVerbSample.trim()}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 ${styles.button}`}
                >
                  Hinzufügen
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Skizzenverhalten: Neue Verben werden lokal hinzugefügt und automatisch ausgewählt.
              </p>
            </div>
          )}
          <div className="mb-3 mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <span>
              {filteredVerbs.length} von {catalogVerbs.length} Verben werden angezeigt
            </span>
            <span>{selectedVerbs.length} ausgewählt</span>
          </div>
          <div className="max-h-[32rem] overflow-y-auto rounded-xl border border-slate-200 bg-white">
            {filteredVerbs.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-500">
                Keine Verben passen zu deiner Suche.
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {filteredVerbs.map((verb) => {
                  const selected = selectedIds.has(verb.id)
                  const expanded = expandedIds.has(verb.id)
                  return (
                    <li
                      key={verb.id}
                      className={`transition ${
                        selected ? styles.selected : 'border-transparent hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 px-3 py-2">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleVerb(verb)}
                          className="h-4 w-4 shrink-0 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          aria-label={`${verb.infinitive} auswählen`}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-slate-900">{verb.infinitive}</p>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                              {getGermanVerbTypeLabel(verb.weakOrStrong)}
                            </span>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                              {getGermanTenseLabel(verb.tense)}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleExpanded(verb.id)}
                          className="shrink-0 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-white"
                          aria-expanded={expanded}
                        >
                          {expanded ? 'Ausblenden' : 'Details'}
                        </button>
                      </div>
                      {expanded && (
                        <div className="border-t border-slate-100 bg-white/70 px-10 pb-3 pt-2 text-sm text-slate-600">
                          <p>Bedeutung: {verb.meaning}</p>
                          <p>Beispiel: {verb.sample}</p>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {(['Present', 'Past', 'Future'] as SketchGermanVerb['tense'][]).map((tense) => (
              <label key={tense} className="rounded-xl border border-slate-200 p-3 text-sm">
                <input type="checkbox" defaultChecked={tense === 'Present'} className="mr-2" />
                {getGermanTenseLabel(tense)}
              </label>
            ))}
          </div>
        </section>
        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900">Übungsoptionen</h3>
          <p className={`mt-2 rounded-xl border p-3 text-sm ${styles.soft}`}>
            {selectedVerbs.length} Verben ausgewählt. Die Konjugationstabelle bleibt während der Antwort ausgeblendet.
          </p>
          <button
            type="button"
            onClick={() => {
              setShowTable(false)
              setScreen('exercise')
            }}
            disabled={selectedVerbs.length === 0}
            className={`mt-4 w-full rounded-lg px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 ${styles.button}`}
          >
            Übung starten
          </button>
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
  eyebrow = 'Exercise proposal',
  backLabel = 'Back to modules',
  children,
}: {
  title: string
  subtitle: string
  styles: (typeof ACCENTS)[Accent]
  onBack?: () => void
  eyebrow?: string
  backLabel?: string
  children: ReactNode
}) {
  return (
    <section>
      {onBack && (
        <button type="button" onClick={onBack} className={`mb-4 text-sm ${styles.text} hover:underline`}>
          {backLabel}
        </button>
      )}
      <div className="mb-5">
        <p className={`text-sm font-semibold ${styles.text}`}>{eyebrow}</p>
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
