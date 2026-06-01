import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '@/auth/context/AuthContext'
import { fetchWithAuth, germanVerbsUrl } from '@/api/client'
import { germanVerbsEndpoints } from '@/api/endpoints'
import type {
  GermanVerbSelectionResponse,
  VerbConjugationExerciseEvaluateResponse,
  VerbConjugationExerciseGenerateResponse,
} from '../types'

interface ConjugationMcExerciseViewProps {
  selections: GermanVerbSelectionResponse[]
  onOpenSelector: () => void
}

const TENSES = [
  { id: 'present', label: 'Present' },
  { id: 'past', label: 'Past' },
  { id: 'future', label: 'Future' },
] as const

const PERSONS = [
  { id: '1sg', label: 'ich' },
  { id: '2sg', label: 'du' },
  { id: '3sg', label: 'er/sie/es' },
  { id: '1pl', label: 'wir' },
  { id: '2pl', label: 'ihr' },
  { id: '3pl', label: 'sie/Sie' },
] as const

export function ConjugationMcExerciseView({
  selections,
  onOpenSelector,
}: ConjugationMcExerciseViewProps) {
  const { token } = useAuth()
  const [tense, setTense] = useState('present')
  const [person, setPerson] = useState('3sg')
  const [exercise, setExercise] = useState<VerbConjugationExerciseGenerateResponse | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [evaluation, setEvaluation] = useState<VerbConjugationExerciseEvaluateResponse | null>(null)
  const [generating, setGenerating] = useState(false)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const initialGenerated = useRef(false)

  const hasSelections = selections.length > 0

  const generateExercise = useCallback(async () => {
    if (!hasSelections) return
    setGenerating(true)
    setExercise(null)
    setSelectedAnswer(null)
    setEvaluation(null)
    setError(null)
    try {
      const res = await fetchWithAuth(
        germanVerbsUrl(germanVerbsEndpoints.exercises.conjugation.generate),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tense, person }),
        },
        token,
      )
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        setError(body?.detail ?? 'Failed to generate exercise.')
        return
      }
      setExercise(await res.json())
    } catch {
      setError('Network error generating exercise.')
    } finally {
      setGenerating(false)
    }
  }, [hasSelections, person, tense, token])

  useEffect(() => {
    if (hasSelections && !initialGenerated.current) {
      initialGenerated.current = true
      void generateExercise()
    }
  }, [generateExercise, hasSelections])

  const handleCheck = useCallback(async () => {
    if (!exercise || !selectedAnswer) return
    setChecking(true)
    setError(null)
    try {
      const res = await fetchWithAuth(
        germanVerbsUrl(germanVerbsEndpoints.exercises.conjugation.evaluate),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            german_verb_id: exercise.german_verb_id,
            tense: exercise.tense,
            person: exercise.person,
            user_answer: selectedAnswer,
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
  }, [exercise, selectedAnswer, token])

  if (!hasSelections) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
        <p className="font-medium">No verbs selected.</p>
        <button
          type="button"
          onClick={onOpenSelector}
          className="mt-3 rounded-lg bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700"
        >
          Select verbs
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-blue-700">German Verbs</p>
          <h2 className="text-xl font-bold text-slate-900">Quick conjugation</h2>
        </div>
        <button
          type="button"
          onClick={onOpenSelector}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          Change saved verbs
        </button>
      </div>

      <div className="mb-5 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">
          Tense
          <select
            value={tense}
            onChange={(e) => setTense(e.target.value)}
            disabled={generating || !!exercise && !evaluation}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {TENSES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          Person
          <select
            value={person}
            onChange={(e) => setPerson(e.target.value)}
            disabled={generating || !!exercise && !evaluation}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {PERSONS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {generating && !exercise && <p className="text-sm text-slate-500">Generating...</p>}

      {exercise && (
        <>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="font-semibold text-slate-900">{exercise.infinitive}</p>
            <p className="text-sm text-slate-600">{exercise.definition}</p>
            <p className="mt-2 text-sm text-slate-800">{exercise.prompt_native}</p>
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {exercise.options.map((option) => (
              <button
                key={option}
                type="button"
                disabled={!!evaluation}
                onClick={() => setSelectedAnswer(option)}
                className={`rounded-xl border px-4 py-3 text-left text-sm font-medium ${
                  selectedAnswer === option
                    ? 'border-blue-400 bg-blue-50 text-blue-900'
                    : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          {!evaluation && (
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => void generateExercise()}
                disabled={generating}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700"
              >
                New verb
              </button>
              <button
                type="button"
                onClick={handleCheck}
                disabled={!selectedAnswer || checking}
                className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {checking ? 'Checking...' : 'Check'}
              </button>
            </div>
          )}

          {evaluation && (
            <div
              className={`mt-5 rounded-xl border p-4 ${
                evaluation.is_correct
                  ? 'border-emerald-200 bg-emerald-50'
                  : 'border-amber-300 bg-amber-50'
              }`}
            >
              <p className="text-sm font-semibold">{evaluation.is_correct ? 'Correct!' : 'Not yet'}</p>
              <p className="mt-1 text-sm text-slate-700">{evaluation.feedback}</p>
              <button
                type="button"
                onClick={() => void generateExercise()}
                className="mt-4 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
