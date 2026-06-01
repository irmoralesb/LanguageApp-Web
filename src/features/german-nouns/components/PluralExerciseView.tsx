import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '@/auth/context/AuthContext'
import { fetchWithAuth, germanNounsUrl } from '@/api/client'
import { germanNounsEndpoints } from '@/api/endpoints'
import type {
  GermanNounSelectionResponse,
  NounPluralExerciseEvaluateResponse,
  NounPluralExerciseGenerateResponse,
} from '../types'

interface PluralExerciseViewProps {
  selections: GermanNounSelectionResponse[]
  onOpenSelector: () => void
}

export function PluralExerciseView({ selections, onOpenSelector }: PluralExerciseViewProps) {
  const { token } = useAuth()
  const [exercise, setExercise] = useState<NounPluralExerciseGenerateResponse | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [evaluation, setEvaluation] = useState<NounPluralExerciseEvaluateResponse | null>(null)
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
        germanNounsUrl(germanNounsEndpoints.exercises.plural.generate),
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) },
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
  }, [hasSelections, token])

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
        germanNounsUrl(germanNounsEndpoints.exercises.plural.evaluate),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            german_noun_id: exercise.german_noun_id,
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
        <p className="font-medium">Select nouns with plural forms first.</p>
        <button
          type="button"
          onClick={onOpenSelector}
          className="mt-3 rounded-lg bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700"
        >
          Select nouns
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

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-indigo-700">German Nouns</p>
          <h2 className="text-xl font-bold text-slate-900">Plural + article</h2>
        </div>
        <button
          type="button"
          onClick={onOpenSelector}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          Change saved nouns
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {exercise && (
        <>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-lg font-medium text-slate-900">{exercise.prompt_native}</p>
            <p className="mt-2 text-xs text-slate-500">
              Missed before: {exercise.incorrect_attempts} · Correct: {exercise.correct_attempts}
            </p>
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {exercise.options.map((option) => (
              <button
                key={option}
                type="button"
                disabled={!!evaluation}
                onClick={() => setSelectedAnswer(option)}
                className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
                  selectedAnswer === option
                    ? 'border-indigo-400 bg-indigo-50 text-indigo-900'
                    : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
                } disabled:opacity-70`}
              >
                {option}
              </button>
            ))}
          </div>

          {!evaluation && (
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={handleCheck}
                disabled={!selectedAnswer || checking}
                className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
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
              <p className="text-sm font-semibold text-slate-800">
                {evaluation.is_correct ? 'Correct!' : 'Not yet'}
              </p>
              <p className="mt-1 text-sm text-slate-700">{evaluation.feedback}</p>
              {!evaluation.is_correct && (
                <p className="mt-2 text-sm text-slate-600">
                  <span className="font-medium">Answer:</span> {evaluation.correct_phrase}
                </p>
              )}
              <button
                type="button"
                onClick={() => {
                  initialGenerated.current = false
                  void generateExercise()
                }}
                className="mt-4 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
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
