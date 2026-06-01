import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '@/auth/context/AuthContext'
import { englishUrl, fetchWithAuth } from '@/api/client'
import { expressionsEndpoints } from '@/api/endpoints'
import type {
  EnglishExpressionSelectionResponse,
  ExpressionExerciseEvaluationResponse,
  ExpressionMcPromptResponse,
} from '../types'

interface CollocationChoiceExerciseViewProps {
  selections: EnglishExpressionSelectionResponse[]
  onOpenSelector: () => void
}

function renderMcSentence(sentence: string) {
  return sentence.includes('___') ? (
    <p className="text-lg font-medium text-slate-900">
      {sentence.split('___').map((part, index, arr) => (
        <span key={`${part}-${index}`}>
          {part}
          {index < arr.length - 1 ? (
            <span className="mx-1 inline-block rounded bg-teal-100 px-2 py-0.5 text-teal-800">
              ___
            </span>
          ) : null}
        </span>
      ))}
    </p>
  ) : (
    <p className="text-lg font-medium text-slate-900">{sentence}</p>
  )
}

export function CollocationChoiceExerciseView({
  selections,
  onOpenSelector,
}: CollocationChoiceExerciseViewProps) {
  const { token } = useAuth()
  const [exercise, setExercise] = useState<ExpressionMcPromptResponse | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
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
    setSelectedAnswer(null)
    setEvaluation(null)
    setError(null)
    try {
      const res = await fetchWithAuth(
        englishUrl(expressionsEndpoints.exercises.collocationChoice.generate),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
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
    if (!exercise || !selectedAnswer) return
    setChecking(true)
    setError(null)
    try {
      const res = await fetchWithAuth(
        englishUrl(expressionsEndpoints.exercises.collocationChoice.evaluate),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt_token: exercise.prompt_token,
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
          <p className="text-sm font-semibold text-teal-700">Collocation Choice</p>
          <h2 className="text-xl font-bold text-slate-900">Pick the natural collocation</h2>
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
            <strong>{exercise.text}</strong> — {exercise.definition}
          </div>

          {exercise.scenario_native && (
            <div className="mb-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Scenario
              </p>
              <p className="text-sm text-slate-700">{exercise.scenario_native}</p>
            </div>
          )}

          <div className="mb-4 rounded-xl bg-slate-50 p-4">
            {renderMcSentence(exercise.sentence_with_blank)}
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {exercise.options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => !evaluation && setSelectedAnswer(option)}
                disabled={!!evaluation}
                className={`rounded-lg border px-4 py-3 text-left text-sm font-medium transition ${
                  selectedAnswer === option
                    ? 'border-teal-500 bg-teal-50 text-teal-900'
                    : 'border-slate-200 bg-white text-slate-800 hover:border-teal-300'
                } disabled:cursor-default`}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="mt-4 flex justify-end">
            {!evaluation && (
              <button
                type="button"
                onClick={() => void handleCheck()}
                disabled={!selectedAnswer || checking}
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
