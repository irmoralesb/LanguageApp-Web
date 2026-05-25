import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '@/auth/context/AuthContext'
import { fetchWithAuth, germanNounsUrl } from '@/api/client'
import { germanNounsEndpoints } from '@/api/endpoints'
import type {
  ExerciseEvaluateResponse,
  ExerciseGenerateResponse,
  GermanNounResponse,
  GermanNounSelectionResponse,
} from '../types'

interface ExerciseViewProps {
  selections: GermanNounSelectionResponse[]
  onOpenSelector: () => void
}

const EXERCISE_MODES: Array<'singular' | 'plural'> = ['singular', 'plural']

export function ExerciseView({ selections, onOpenSelector }: ExerciseViewProps) {
  const { token } = useAuth()
  const [nouns, setNouns] = useState<GermanNounResponse[]>([])
  const [exercise, setExercise] = useState<ExerciseGenerateResponse | null>(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [evaluation, setEvaluation] = useState<ExerciseEvaluateResponse | null>(null)
  const [generating, setGenerating] = useState(false)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingNouns, setLoadingNouns] = useState(true)

  const selectedIds = useMemo(() => new Set(selections.map((s) => s.german_noun_id)), [selections])
  const initialGenerated = useRef(false)

  const generateExercise = useCallback(
    async (nounId: string, mode: 'singular' | 'plural') => {
      setGenerating(true)
      setExercise(null)
      setUserAnswer('')
      setEvaluation(null)
      setError(null)
      try {
        const res = await fetchWithAuth(
          germanNounsUrl(germanNounsEndpoints.exercises.generate),
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ german_noun_id: nounId, exercise_mode: mode }),
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
    },
    [token],
  )

  const generateRandom = useCallback(
    (availableNouns: GermanNounResponse[]) => {
      if (availableNouns.length === 0) return
      const noun = availableNouns[Math.floor(Math.random() * availableNouns.length)]
      const mode = EXERCISE_MODES[Math.floor(Math.random() * EXERCISE_MODES.length)]
      generateExercise(noun.id, mode)
    },
    [generateExercise],
  )

  useEffect(() => {
    async function loadAndStart() {
      try {
        const res = await fetchWithAuth(
          germanNounsUrl(germanNounsEndpoints.catalog.list),
          { method: 'GET' },
          token,
        )
        if (!res.ok) {
          setError('Failed to load nouns.')
          return
        }
        const data: GermanNounResponse[] = await res.json()
        const filtered = data.filter((n) => selectedIds.has(n.id))
        setNouns(filtered)
        if (filtered.length > 0 && !initialGenerated.current) {
          initialGenerated.current = true
          generateRandom(filtered)
        }
      } catch {
        setError('Network error loading nouns.')
      } finally {
        setLoadingNouns(false)
      }
    }
    loadAndStart()
  }, [token, selectedIds, generateRandom])

  const handleCheck = useCallback(async () => {
    if (!exercise || !userAnswer.trim()) return
    setChecking(true)
    setError(null)
    try {
      const res = await fetchWithAuth(
        germanNounsUrl(germanNounsEndpoints.exercises.evaluate),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            german_noun_id: exercise.german_noun_id,
            exercise_mode: exercise.exercise_mode,
            scenario_native: exercise.scenario_native,
            prompt_native: exercise.prompt_native,
            expected_answer: exercise.expected_answer,
            user_answer: userAnswer.trim(),
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
  }, [exercise, userAnswer, token])

  if (loadingNouns || (generating && !exercise)) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-slate-500">
          {loadingNouns ? 'Loading your nouns...' : 'Generating exercise...'}
        </p>
      </div>
    )
  }

  if (nouns.length === 0) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
        <p className="font-medium">No nouns selected.</p>
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

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-indigo-700">German Nouns</p>
          <h2 className="text-xl font-bold text-slate-900">Fill in the article and noun</h2>
        </div>
        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {nouns.length} saved noun{nouns.length !== 1 ? 's' : ''} in rotation
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {generating && <p className="text-sm text-slate-500">Generating exercise...</p>}

      {exercise && !generating && (
        <>
          {exercise.scenario_native && (
            <div className="mb-5 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-indigo-700 opacity-70">
                Scenario
              </p>
              <p className="text-sm text-indigo-900">{exercise.scenario_native}</p>
            </div>
          )}

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Prompt
            </p>
            <p className="text-lg font-medium text-slate-900">{exercise.prompt_native}</p>
          </div>

          <label
            htmlFor="noun-user-answer"
            className="mb-1 mt-5 block text-sm font-medium text-slate-700"
          >
            Your answer in German (e.g. der Hund / die Hunde)
          </label>
          <textarea
            id="noun-user-answer"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            disabled={!!evaluation}
            rows={3}
            placeholder="Type your answer here..."
            className="block w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-800 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-50"
          />

          <div className="mt-4 flex justify-end">
            {!evaluation && (
              <button
                type="button"
                onClick={handleCheck}
                disabled={!userAnswer.trim() || checking}
                className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {checking ? 'Checking...' : 'Check'}
              </button>
            )}
          </div>

          {evaluation && (
            <div
              className={`mt-5 rounded-xl border p-4 ${
                evaluation.is_correct
                  ? 'border-emerald-200 bg-emerald-50'
                  : 'border-amber-300 bg-amber-50'
              }`}
            >
              <p
                className={`mb-2 text-sm font-semibold ${
                  evaluation.is_correct ? 'text-emerald-700' : 'text-amber-800'
                }`}
              >
                {evaluation.is_correct ? 'Correct!' : 'Not yet'}
              </p>
              <p className="text-sm text-slate-700">{evaluation.feedback}</p>
              {!evaluation.is_correct && evaluation.correct_example && (
                <div className="mt-3 rounded-lg bg-white p-3 text-sm text-slate-700">
                  <span className="font-medium">Correct answer:</span> {evaluation.correct_example}
                </div>
              )}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={onOpenSelector}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Change saved nouns
            </button>
            {evaluation && (
              <button
                type="button"
                onClick={() => generateRandom(nouns)}
                className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                New exercise
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
