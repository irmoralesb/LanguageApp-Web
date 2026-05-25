import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '@/auth/context/AuthContext'
import { fetchWithAuth, prepositionsUrl } from '@/api/client'
import { prepEndpoints } from '@/api/endpoints'
import type {
  ExerciseEvaluationResponse,
  ExercisePromptResponse,
  PracticeTermResponse,
  PracticeTermSelectionResponse,
  UserProfileResponse,
} from '../types'

interface ExerciseViewProps {
  profile: UserProfileResponse
  selections: PracticeTermSelectionResponse[]
  onOpenSelector: () => void
}

export function ExerciseView({ selections, onOpenSelector }: ExerciseViewProps) {
  const { token } = useAuth()

  const [practiceTerms, setPracticeTerms] = useState<PracticeTermResponse[]>([])
  const [exercise, setExercise] = useState<ExercisePromptResponse | null>(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [evaluation, setEvaluation] = useState<ExerciseEvaluationResponse | null>(null)
  const [generating, setGenerating] = useState(false)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingTerms, setLoadingTerms] = useState(true)

  const selectedIds = useMemo(() => new Set(selections.map((s) => s.practice_term_id)), [selections])
  const initialGenerated = useRef(false)

  const generateExercise = useCallback(
    async (termId: string) => {
      setGenerating(true)
      setExercise(null)
      setUserAnswer('')
      setEvaluation(null)
      setError(null)
      try {
        const res = await fetchWithAuth(
          prepositionsUrl(prepEndpoints.exercises.generate),
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ practice_term_id: termId, target_language_code: 'en' }),
          },
          token,
        )
        if (!res.ok) {
          const body = await res.json().catch(() => null)
          setError(body?.detail ?? 'Failed to generate exercise.')
          return
        }
        const data: ExercisePromptResponse = await res.json()
        setExercise(data)
      } catch {
        setError('Network error generating exercise.')
      } finally {
        setGenerating(false)
      }
    },
    [token],
  )

  useEffect(() => {
    async function loadAndStart() {
      try {
        const res = await fetchWithAuth(
          prepositionsUrl(prepEndpoints.practiceTerms.catalog),
          { method: 'GET' },
          token,
        )
        if (!res.ok) {
          setError('Failed to load practice terms.')
          return
        }
        const data: PracticeTermResponse[] = await res.json()
        const filtered = data.filter((pt) => selectedIds.has(pt.id))
        setPracticeTerms(filtered)
        if (filtered.length > 0 && !initialGenerated.current) {
          initialGenerated.current = true
          const randomId = filtered[Math.floor(Math.random() * filtered.length)].id
          generateExercise(randomId)
        }
      } catch {
        setError('Network error loading practice terms.')
      } finally {
        setLoadingTerms(false)
      }
    }
    loadAndStart()
  }, [token, selectedIds, generateExercise])

  const handleCheck = useCallback(async () => {
    if (!exercise || !userAnswer.trim()) return
    setChecking(true)
    setError(null)
    try {
      const res = await fetchWithAuth(
        prepositionsUrl(prepEndpoints.exercises.evaluate),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            practice_term_id: exercise.practice_term_id,
            target_language_code: exercise.target_language_code,
            scenario_native: exercise.scenario_native,
            sentence_native: exercise.sentence_native,
            sentence_target: exercise.sentence_target,
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
      const data: ExerciseEvaluationResponse = await res.json()
      setEvaluation(data)
    } catch {
      setError('Network error checking answer.')
    } finally {
      setChecking(false)
    }
  }, [exercise, userAnswer, token])

  const handleNewExercise = useCallback(() => {
    if (practiceTerms.length === 0) return
    const randomId = practiceTerms[Math.floor(Math.random() * practiceTerms.length)].id
    generateExercise(randomId)
  }, [practiceTerms, generateExercise])

  if (loadingTerms || (generating && !exercise)) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-slate-500">
          {loadingTerms ? 'Loading your practice terms...' : 'Generating exercise...'}
        </p>
      </div>
    )
  }

  if (practiceTerms.length === 0) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
        <p className="font-medium">No terms selected.</p>
        <button
          type="button"
          onClick={onOpenSelector}
          className="mt-3 rounded-lg bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700"
        >
          Select terms
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-teal-700">Prepositions Practice</p>
          <h2 className="text-xl font-bold text-slate-900">Translate the sentence</h2>
        </div>
        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {practiceTerms.length} saved term{practiceTerms.length !== 1 ? 's' : ''} in rotation
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
            <div className="mb-5 rounded-xl border border-teal-100 bg-teal-50 p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-teal-700 opacity-70">
                Scenario
              </p>
              <p className="text-sm text-teal-900">{exercise.scenario_native}</p>
            </div>
          )}

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Translate using &quot;{exercise.practice_term_text}&quot;
            </p>
            <p className="text-lg font-medium text-slate-900">{exercise.sentence_native}</p>
          </div>

          <label
            htmlFor="prep-user-answer"
            className="mb-1 mt-5 block text-sm font-medium text-slate-700"
          >
            Your answer in English
          </label>
          <textarea
            id="prep-user-answer"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            disabled={!!evaluation}
            rows={4}
            placeholder="Type your sentence here..."
            className="block w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-800 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-50"
          />

          <div className="mt-4 flex justify-end">
            {!evaluation && (
              <button
                type="button"
                onClick={handleCheck}
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
              {!evaluation.is_correct && evaluation.correct_example && (
                <div className="mt-3 rounded-lg bg-white p-3 text-sm text-slate-700">
                  <span className="font-medium">Correct example:</span> {evaluation.correct_example}
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
              Change saved terms
            </button>
            {evaluation && (
              <button
                type="button"
                onClick={handleNewExercise}
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
