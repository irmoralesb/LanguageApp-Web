import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '@/auth/context/AuthContext'
import { englishUrl, fetchWithAuth } from '@/api/client'
import { confusableEndpoints } from '@/api/endpoints'
import type {
  ConfusableWordEvaluationResponse,
  ConfusableWordExercisePromptResponse,
  ConfusableWordPairStatsResponse,
} from '../types'

function renderSentenceWithBlank(
  sentence: string,
  value: string,
  onChange: (value: string) => void,
  disabled: boolean,
) {
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
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              aria-label="Word answer"
              placeholder="?"
              className="w-28 rounded-lg border border-teal-300 bg-white px-2 py-1 text-center text-base font-semibold text-teal-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:bg-slate-50"
            />
          ) : null}
        </span>
      ))}
    </p>
  )
}

export function ConfusableWordsExerciseView() {
  const { token } = useAuth()

  const [exercise, setExercise] = useState<ConfusableWordExercisePromptResponse | null>(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [evaluation, setEvaluation] = useState<ConfusableWordEvaluationResponse | null>(null)
  const [pairStats, setPairStats] = useState<ConfusableWordPairStatsResponse[]>([])
  const [generating, setGenerating] = useState(false)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initialGenerated = useRef(false)

  const weakPairs = useMemo(
    () =>
      pairStats
        .filter((s) => s.incorrect_count > 0)
        .sort((a, b) => b.incorrect_count - a.incorrect_count)
        .slice(0, 3),
    [pairStats],
  )

  const loadStats = useCallback(async () => {
    try {
      const res = await fetchWithAuth(
        englishUrl(confusableEndpoints.exercises.stats),
        { method: 'GET' },
        token,
      )
      if (res.ok) {
        setPairStats(await res.json())
      }
    } catch {
      /* stats are optional */
    }
  }, [token])

  const generateExercise = useCallback(async () => {
    setGenerating(true)
    setExercise(null)
    setUserAnswer('')
    setEvaluation(null)
    setError(null)
    try {
      const res = await fetchWithAuth(
        englishUrl(confusableEndpoints.exercises.generate),
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
      await loadStats()
    } catch {
      setError('Network error generating exercise.')
    } finally {
      setGenerating(false)
    }
  }, [token, loadStats])

  useEffect(() => {
    if (!initialGenerated.current) {
      initialGenerated.current = true
      void loadStats()
      void generateExercise()
    }
  }, [generateExercise, loadStats])

  const handleCheck = useCallback(async () => {
    if (!exercise || !userAnswer.trim()) return
    setChecking(true)
    setError(null)
    try {
      const res = await fetchWithAuth(
        englishUrl(confusableEndpoints.exercises.evaluate),
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
      await loadStats()
    } catch {
      setError('Network error checking answer.')
    } finally {
      setChecking(false)
    }
  }, [exercise, userAnswer, token, loadStats])

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
        <p className="text-sm font-semibold text-teal-700">Confusable Words</p>
        <h2 className="text-xl font-bold text-slate-900">Choose the correct word</h2>
      </div>

      {weakPairs.length > 0 && (
        <div className="mb-4 rounded-xl border border-amber-100 bg-amber-50 p-3 text-sm text-amber-900">
          <p className="font-medium">Practice focus</p>
          <p className="mt-1 text-amber-800">
            You will see more exercises for pairs you miss often, such as{' '}
            {weakPairs.map((s, i) => (
              <span key={`${s.option_a}-${s.option_b}`}>
                {i > 0 ? ', ' : ''}
                <strong>
                  {s.option_a} / {s.option_b}
                </strong>
              </span>
            ))}
            .
          </p>
        </div>
      )}

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
          <div className="mb-4 rounded-xl border border-teal-100 bg-teal-50 px-4 py-3 text-sm text-teal-900">
            Choose between <strong>&quot;{exercise.option_a}&quot;</strong> or{' '}
            <strong>&quot;{exercise.option_b}&quot;</strong>
          </div>

          {exercise.scenario_native && (
            <div className="mb-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Scenario
              </p>
              <p className="text-sm text-slate-700">{exercise.scenario_native}</p>
            </div>
          )}

          <div className="rounded-xl bg-slate-50 p-4">
            {renderSentenceWithBlank(
              exercise.sentence_with_blank,
              userAnswer,
              setUserAnswer,
              !!evaluation,
            )}
          </div>

          <div className="mt-4 flex justify-end">
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
                {evaluation.is_correct ? 'Correct!' : 'Not yet'}
              </p>
              <p className="text-sm text-slate-700">{evaluation.feedback}</p>
              {!evaluation.is_correct && evaluation.sentence_complete && (
                <div className="mt-3 rounded-lg bg-white p-3 text-sm text-slate-700">
                  <span className="font-medium">Correct sentence:</span>{' '}
                  {evaluation.sentence_complete}
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
