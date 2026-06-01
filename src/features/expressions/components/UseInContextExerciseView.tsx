import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '@/auth/context/AuthContext'
import { englishUrl, fetchWithAuth } from '@/api/client'
import { expressionsEndpoints } from '@/api/endpoints'
import type {
  EnglishExpressionSelectionResponse,
  ExpressionExerciseEvaluationResponse,
  UseInContextPromptResponse,
} from '../types'

interface UseInContextExerciseViewProps {
  selections: EnglishExpressionSelectionResponse[]
  onOpenSelector: () => void
}

export function UseInContextExerciseView({
  selections,
  onOpenSelector,
}: UseInContextExerciseViewProps) {
  const { token } = useAuth()
  const [exercise, setExercise] = useState<UseInContextPromptResponse | null>(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [evaluation, setEvaluation] = useState<ExpressionExerciseEvaluationResponse | null>(null)
  const [generating, setGenerating] = useState(false)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const initialGenerated = useRef(false)

  const hasSelections = selections.length > 0

  const generateExercise = useCallback(async () => {
    if (!hasSelections) return
    setGenerating(true)
    setExercise(null)
    setUserAnswer('')
    setEvaluation(null)
    setError(null)
    try {
      const res = await fetchWithAuth(
        englishUrl(expressionsEndpoints.exercises.useInContext.generate),
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
  }, [hasSelections, token])

  useEffect(() => {
    if (hasSelections && !initialGenerated.current) {
      initialGenerated.current = true
      void generateExercise()
    }
  }, [generateExercise, hasSelections])

  const handleCheck = useCallback(async () => {
    if (!exercise || !userAnswer.trim()) return
    setChecking(true)
    setError(null)
    try {
      const res = await fetchWithAuth(
        englishUrl(expressionsEndpoints.exercises.useInContext.evaluate),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            english_expression_id: exercise.english_expression_id,
            target_language_code: exercise.target_language_code,
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

  if (!hasSelections) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
        <p className="font-medium">No expressions selected.</p>
        <button type="button" onClick={onOpenSelector} className="mt-2 underline">
          Choose expressions
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
          <p className="text-sm font-semibold text-teal-700">Use in Context</p>
          <h2 className="text-xl font-bold text-slate-900">Write a sentence</h2>
        </div>
        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {selections.length} saved expression{selections.length !== 1 ? 's' : ''}
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {exercise && (
        <>
          <div className="mb-4 rounded-xl border border-teal-100 bg-teal-50 px-4 py-3 text-sm text-teal-900">
            Use <strong>{exercise.text}</strong> ({exercise.expression_type}) — {exercise.definition}
          </div>

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
              Prompt
            </p>
            <p className="text-sm text-slate-800">{exercise.prompt_native}</p>
          </div>

          <label htmlFor="use-in-context-answer" className="mb-1 block text-sm font-medium text-slate-700">
            Your sentence
          </label>
          <textarea
            id="use-in-context-answer"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            disabled={!!evaluation}
            rows={4}
            placeholder="Write a sentence using the expression..."
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
                {evaluation.is_correct ? 'Great sentence!' : 'Keep practicing'}
              </p>
              <p className="text-sm text-slate-700">{evaluation.feedback}</p>
              {evaluation.correct_example && (
                <div className="mt-3 rounded-lg bg-white p-3 text-sm text-slate-700">
                  <span className="font-medium">Example:</span> {evaluation.correct_example}
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
              Change saved expressions
            </button>
            {evaluation && (
              <button
                type="button"
                onClick={() => void generateExercise()}
                className="rounded-lg bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-700"
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
