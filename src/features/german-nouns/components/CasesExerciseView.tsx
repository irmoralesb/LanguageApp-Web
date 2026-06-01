import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '@/auth/context/AuthContext'
import { fetchWithAuth, germanNounsUrl } from '@/api/client'
import { germanNounsEndpoints } from '@/api/endpoints'
import type {
  GermanGrammaticalCase,
  GermanNounSelectionResponse,
  NounCaseExerciseEvaluateResponse,
  NounCaseExerciseGenerateResponse,
} from '../types'

interface CasesExerciseViewProps {
  selections: GermanNounSelectionResponse[]
  practiceCases: GermanGrammaticalCase[]
  onOpenSelector: () => void
}

const CASE_LABELS: Record<GermanGrammaticalCase, string> = {
  nominativ: 'Nominativ',
  akkusativ: 'Akkusativ',
  dativ: 'Dativ',
  genitiv: 'Genitiv',
}

function renderSentenceWithBlank(sentence: string, selectedArticle: string | null) {
  const parts = sentence.split('___')
  if (parts.length === 1) {
    return <p className="text-lg font-medium text-slate-900">{sentence}</p>
  }

  return (
    <p className="flex flex-wrap items-center gap-2 text-lg font-medium text-slate-900">
      {parts.map((part, index) => (
        <span key={`${part}-${index}`} className="inline-flex flex-wrap items-center gap-2">
          {part ? <span>{part}</span> : null}
          {index < parts.length - 1 ? (
            <span
              className={`min-w-[3rem] rounded-lg border px-2 py-1 text-center text-base font-semibold ${
                selectedArticle
                  ? 'border-indigo-300 bg-indigo-50 text-indigo-900'
                  : 'border-dashed border-slate-300 bg-slate-50 text-slate-400'
              }`}
            >
              {selectedArticle ?? '?'}
            </span>
          ) : null}
        </span>
      ))}
    </p>
  )
}

export function CasesExerciseView({
  selections,
  practiceCases,
  onOpenSelector,
}: CasesExerciseViewProps) {
  const { token } = useAuth()
  const [exercise, setExercise] = useState<NounCaseExerciseGenerateResponse | null>(null)
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null)
  const [evaluation, setEvaluation] = useState<NounCaseExerciseEvaluateResponse | null>(null)
  const [generating, setGenerating] = useState(false)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const initialGenerated = useRef(false)

  const hasEnoughSelections = selections.length > 0 && practiceCases.length > 0

  const generateExercise = useCallback(async () => {
    if (!hasEnoughSelections) return
    setGenerating(true)
    setExercise(null)
    setSelectedArticle(null)
    setEvaluation(null)
    setError(null)
    try {
      const res = await fetchWithAuth(
        germanNounsUrl(germanNounsEndpoints.exercises.cases.generate),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cases: practiceCases }),
        },
        token,
      )
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        setError(body?.detail ?? 'Failed to generate exercise.')
        return
      }
      const data: NounCaseExerciseGenerateResponse = await res.json()
      setExercise(data)
    } catch {
      setError('Network error generating exercise.')
    } finally {
      setGenerating(false)
    }
  }, [hasEnoughSelections, practiceCases, token])

  useEffect(() => {
    if (hasEnoughSelections && !initialGenerated.current) {
      initialGenerated.current = true
      void generateExercise()
    }
  }, [generateExercise, hasEnoughSelections])

  const handleCheck = useCallback(async () => {
    if (!exercise || !selectedArticle) return
    setChecking(true)
    setError(null)
    try {
      const res = await fetchWithAuth(
        germanNounsUrl(germanNounsEndpoints.exercises.cases.evaluate),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            german_noun_id: exercise.german_noun_id,
            grammatical_case: exercise.grammatical_case,
            selected_article: selectedArticle,
            sentence_with_blank: exercise.sentence_with_blank,
          }),
        },
        token,
      )
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        setError(body?.detail ?? 'Failed to evaluate answer.')
        return
      }
      setEvaluation(await res.json())
    } catch {
      setError('Network error checking answer.')
    } finally {
      setChecking(false)
    }
  }, [exercise, selectedArticle, token])

  const handleNext = useCallback(() => {
    initialGenerated.current = true
    void generateExercise()
  }, [generateExercise])

  if (!hasEnoughSelections) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        <p className="font-semibold">Cases practice needs setup</p>
        <p className="mt-2">
          Select at least one noun and one grammatical case (Nominativ, Akkusativ, Dativ, or Genitiv)
          before starting.
        </p>
        <button
          type="button"
          onClick={onOpenSelector}
          className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Choose nouns and cases
        </button>
      </div>
    )
  }

  if (generating && !exercise) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-slate-500">Generating exercise...</p>
      </div>
    )
  }

  const practicedCaseLabels = practiceCases.map((c) => CASE_LABELS[c]).join(', ')

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-indigo-700">German Noun Cases</p>
          <h2 className="text-xl font-bold text-slate-900">Pick the correct article</h2>
          <p className="mt-1 text-sm text-slate-600">
            Practicing: {practicedCaseLabels}. Using {selections.length} saved noun
            {selections.length !== 1 ? 's' : ''}. Nouns you miss appear more often.
          </p>
        </div>
        {exercise && exercise.incorrect_attempts > 0 && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
            Needs practice ({exercise.incorrect_attempts} missed)
          </span>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {exercise && (
        <>
          <div className="mb-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {exercise.case_label}
            </p>
            <p className="mt-1 text-sm text-slate-600">{exercise.scenario_native}</p>
            <p className="mt-1 text-xs text-slate-500">
              Hint: {exercise.definition} ({exercise.singular})
            </p>
          </div>

          <div className="mb-6 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
            {renderSentenceWithBlank(exercise.sentence_with_blank, selectedArticle)}
          </div>

          {!evaluation && (
            <div className="mb-6">
              <p className="mb-3 text-sm font-medium text-slate-700">Choose the article</p>
              <div className="flex flex-wrap gap-2">
                {exercise.article_options.map((article) => (
                  <button
                    key={article}
                    type="button"
                    onClick={() => setSelectedArticle(article)}
                    disabled={checking}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize transition ${
                      selectedArticle === article
                        ? 'bg-indigo-600 text-white'
                        : 'border border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                    } disabled:opacity-50`}
                  >
                    {article}
                  </button>
                ))}
              </div>
            </div>
          )}

          {evaluation && (
            <div
              className={`mb-6 rounded-xl border p-4 text-sm ${
                evaluation.is_correct
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                  : 'border-amber-200 bg-amber-50 text-amber-900'
              }`}
            >
              <p className="font-semibold">{evaluation.is_correct ? 'Correct!' : 'Not quite'}</p>
              <p className="mt-1">{evaluation.feedback}</p>
              {!evaluation.is_correct && (
                <p className="mt-2 font-medium">{evaluation.correct_phrase}</p>
              )}
            </div>
          )}

          <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onOpenSelector}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Change nouns or cases
            </button>
            {!evaluation ? (
              <button
                type="button"
                onClick={handleCheck}
                disabled={!selectedArticle || checking}
                className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {checking ? 'Checking...' : 'Check answer'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                disabled={generating}
                className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {generating ? 'Loading...' : 'Next exercise'}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
