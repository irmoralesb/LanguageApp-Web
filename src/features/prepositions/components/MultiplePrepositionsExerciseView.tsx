import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '@/auth/context/AuthContext'
import { fetchWithAuth, prepositionsUrl } from '@/api/client'
import { prepEndpoints } from '@/api/endpoints'
import type {
  MultiplePrepositionsEvaluationResponse,
  MultiplePrepositionsExercisePromptResponse,
  PracticeTermSelectionResponse,
  UserProfileResponse,
} from '../types'

interface MultiplePrepositionsExerciseViewProps {
  profile: UserProfileResponse
  selections: PracticeTermSelectionResponse[]
  onOpenSelector: () => void
}

interface AttemptFeedback {
  attempt: 1 | 2
  evaluation: MultiplePrepositionsEvaluationResponse
}

export function MultiplePrepositionsExerciseView({
  selections,
  onOpenSelector,
}: MultiplePrepositionsExerciseViewProps) {
  const { token } = useAuth()

  const [exercise, setExercise] = useState<MultiplePrepositionsExercisePromptResponse | null>(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [history, setHistory] = useState<AttemptFeedback[]>([])
  const [attempt, setAttempt] = useState<1 | 2>(1)
  const [generating, setGenerating] = useState(false)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [prepositionsVisible, setPrepositionsVisible] = useState(false)

  const initialGenerated = useRef(false)
  const hasEnoughSelections = selections.length >= 2

  const lockedReveal =
    history.length > 0 &&
    (history[history.length - 1].evaluation.is_correct ||
      history[history.length - 1].attempt === 2)

  const resetExerciseState = () => {
    setExercise(null)
    setUserAnswer('')
    setHistory([])
    setAttempt(1)
    setError(null)
    setPrepositionsVisible(false)
  }

  const generateExercise = useCallback(async () => {
    setGenerating(true)
    resetExerciseState()
    try {
      const res = await fetchWithAuth(
        prepositionsUrl(prepEndpoints.exercises.multiplePrepositions.generate),
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
      const data: MultiplePrepositionsExercisePromptResponse = await res.json()
      setExercise(data)
    } catch {
      setError('Network error generating exercise.')
    } finally {
      setGenerating(false)
    }
  }, [token])

  useEffect(() => {
    if (hasEnoughSelections && !initialGenerated.current) {
      initialGenerated.current = true
      generateExercise()
    }
  }, [hasEnoughSelections, generateExercise])

  const handleCheck = useCallback(async () => {
    if (!exercise || !userAnswer.trim()) return
    setChecking(true)
    setError(null)
    try {
      const res = await fetchWithAuth(
        prepositionsUrl(prepEndpoints.exercises.multiplePrepositions.evaluate),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt_token: exercise.prompt_token,
            user_answer: userAnswer.trim(),
            attempt_number: attempt,
          }),
        },
        token,
      )
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        setError(body?.detail ?? 'Failed to evaluate answer.')
        return
      }
      const data: MultiplePrepositionsEvaluationResponse = await res.json()
      setHistory((h) => [...h, { attempt, evaluation: data }])

      if (!data.is_correct && attempt === 1) {
        setAttempt(2)
        setUserAnswer('')
      }
    } catch {
      setError('Network error checking answer.')
    } finally {
      setChecking(false)
    }
  }, [exercise, userAnswer, attempt, token])

  if (!hasEnoughSelections) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
        <p className="mb-2 font-medium">You need at least 2 selected prepositions for this exercise.</p>
        <p className="mb-4">
          Pick more prepositions in the term selector, then come back to translate full sentences
          using several prepositions at once.
        </p>
        <button
          type="button"
          onClick={onOpenSelector}
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700"
        >
          Select prepositions
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
          <p className="text-sm font-semibold text-teal-700">Multiple Prepositions Practice</p>
          <h2 className="text-xl font-bold text-slate-900">Mixed sentence translation</h2>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onOpenSelector}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            Change terms
          </button>
          <button
            type="button"
            onClick={generateExercise}
            disabled={generating}
            className="rounded-lg bg-teal-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {generating ? 'Generating...' : 'New exercise'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {generating && <p className="text-sm text-slate-500">Generating exercise...</p>}

      {exercise && !generating && (
        <div className="space-y-4">
          <div className="rounded-xl border border-teal-100 bg-teal-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-teal-700 opacity-70">
                Translate to English using ALL of these prepositions
              </p>
              <button
                type="button"
                onClick={() => setPrepositionsVisible((v) => !v)}
                className="flex items-center gap-1 rounded-lg border border-teal-200 bg-white px-2.5 py-1 text-xs text-teal-700 hover:bg-teal-50"
              >
                {prepositionsVisible ? 'Hide hint' : 'Show hint'}
              </button>
            </div>
            {prepositionsVisible && (
              <div className="mb-3 flex flex-wrap gap-2">
                {exercise.practice_term_texts.map((p) => (
                  <span
                    key={p}
                    className="rounded-full border border-teal-200 bg-white px-3 py-1 text-sm font-medium text-teal-900"
                  >
                    {p}
                  </span>
                ))}
              </div>
            )}
            <p className="text-lg font-medium text-teal-900">{exercise.sentence_native}</p>
          </div>

          <div>
            <label
              htmlFor="multi-prep-user-answer"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Your English translation
              <span className="ml-2 text-xs font-normal text-slate-500">
                (attempt {attempt} of 2)
              </span>
            </label>
            <textarea
              id="multi-prep-user-answer"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              disabled={lockedReveal}
              rows={4}
              placeholder="Type your translation here..."
              className="block w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-800 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-50"
            />
          </div>

          {!lockedReveal && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleCheck}
                disabled={!userAnswer.trim() || checking}
                className="rounded-lg bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {checking ? 'Checking...' : attempt === 1 ? 'Check' : 'Submit second try'}
              </button>
            </div>
          )}

          {history.map(({ attempt: a, evaluation }, index) => {
            const isLast = index === history.length - 1
            const showCorrect =
              isLast &&
              !evaluation.is_correct &&
              a === 2 &&
              evaluation.correct_sentence_target

            return (
              <div
                key={index}
                className={`rounded-xl border p-4 ${
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
                  Attempt {a}: {evaluation.is_correct ? 'Correct!' : 'Not yet'}
                </p>

                {evaluation.feedback && (
                  <p className="mb-3 text-sm text-slate-700">{evaluation.feedback}</p>
                )}

                {evaluation.preposition_feedback.length > 0 && (
                  <ul className="mb-3 space-y-1 text-sm">
                    {evaluation.preposition_feedback.map((item) => (
                      <li
                        key={item.preposition}
                        className={item.used_correctly ? 'text-emerald-700' : 'text-amber-800'}
                      >
                        <span className="font-semibold">
                          {item.used_correctly ? '✓' : '✗'} {item.preposition}:
                        </span>{' '}
                        {item.explanation}
                      </li>
                    ))}
                  </ul>
                )}

                {evaluation.minor_issues.length > 0 && (
                  <div className="mb-3 text-sm text-slate-600">
                    <p className="font-medium">Minor notes:</p>
                    <ul className="list-disc pl-5">
                      {evaluation.minor_issues.map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {showCorrect && (
                  <div className="mt-2 rounded-lg bg-white p-3 text-sm text-slate-800">
                    <span className="font-medium">Correct sentence:</span>{' '}
                    {evaluation.correct_sentence_target}
                  </div>
                )}

                {isLast && !evaluation.is_correct && a === 1 && (
                  <p className="mt-2 text-xs text-slate-500">
                    You have one more try. Adjust your translation and submit again.
                  </p>
                )}
              </div>
            )
          })}

          {lockedReveal && (
            <div className="border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={generateExercise}
                className="rounded-lg bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-700"
              >
                New exercise
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
