import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '@/auth/context/AuthContext'
import { englishUrl, fetchWithAuth } from '@/api/client'
import { naturalRewriteEndpoints } from '@/api/endpoints'
import type {
  NaturalRewriteEvaluationResponse,
  NaturalRewriteExercisePromptResponse,
} from '../types'

export function NaturalRewriteExerciseView() {
  const { token } = useAuth()

  const [exercise, setExercise] = useState<NaturalRewriteExercisePromptResponse | null>(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [evaluation, setEvaluation] = useState<NaturalRewriteEvaluationResponse | null>(null)
  const [generating, setGenerating] = useState(false)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initialGenerated = useRef(false)

  const generateExercise = useCallback(async () => {
    setGenerating(true)
    setExercise(null)
    setUserAnswer('')
    setEvaluation(null)
    setError(null)
    try {
      const res = await fetchWithAuth(
        englishUrl(naturalRewriteEndpoints.exercises.generate),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ target_language_code: 'en' }),
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
  }, [token])

  useEffect(() => {
    if (!initialGenerated.current) {
      initialGenerated.current = true
      void generateExercise()
    }
  }, [generateExercise])

  const handleCheck = useCallback(async () => {
    if (!exercise || !userAnswer.trim()) return
    setChecking(true)
    setError(null)
    try {
      const res = await fetchWithAuth(
        englishUrl(naturalRewriteEndpoints.exercises.evaluate),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt_token: exercise.prompt_token,
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

  if (generating && !exercise) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-slate-500">Generating exercise...</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-5">
        <p className="text-sm font-semibold text-teal-700">Natural Rewrite</p>
        <h2 className="text-xl font-bold text-slate-900">Make it sound natural</h2>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
          {!exercise && (
            <button
              type="button"
              onClick={() => void generateExercise()}
              className="mt-2 block rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-white hover:bg-slate-700"
            >
              Try again
            </button>
          )}
        </div>
      )}

      {generating && <p className="text-sm text-slate-500">Generating exercise...</p>}

      {exercise && !generating && (
        <>
          {exercise.scenario_native && (
            <div className="mb-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Scenario
              </p>
              <p className="text-sm text-slate-700">{exercise.scenario_native}</p>
            </div>
          )}

          <div className="mb-4 rounded-xl border border-amber-100 bg-amber-50 p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
              Stiff sentence
            </p>
            <p className="text-base font-medium text-slate-900">{exercise.stiff_sentence}</p>
            {exercise.context_note && (
              <p className="mt-2 text-sm text-amber-800">{exercise.context_note}</p>
            )}
          </div>

          <label htmlFor="natural-rewrite-answer" className="mb-1 block text-sm font-medium text-slate-700">
            Your natural rewrite
          </label>
          <textarea
            id="natural-rewrite-answer"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            disabled={!!evaluation}
            rows={4}
            placeholder="Write a more natural version..."
            className="mb-4 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:bg-slate-50"
          />

          <div className="flex justify-end">
            {!evaluation && (
              <button
                type="button"
                onClick={() => void handleCheck()}
                disabled={!userAnswer.trim() || checking}
                className="rounded-lg bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
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
                {evaluation.is_correct ? 'Great rewrite!' : 'Keep practicing'}
              </p>
              <p className="text-sm text-slate-700">{evaluation.feedback}</p>
              {evaluation.model_answer && (
                <div className="mt-3 rounded-lg bg-white p-3 text-sm text-slate-700">
                  <span className="font-medium">Example answer:</span> {evaluation.model_answer}
                </div>
              )}
            </div>
          )}

          {evaluation && (
            <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => void generateExercise()}
                className="rounded-lg bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-700"
              >
                New exercise
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
