import { useCallback, useEffect, useMemo, useState } from 'react'
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
  const [selectedTermId, setSelectedTermId] = useState('')
  const [exercise, setExercise] = useState<ExercisePromptResponse | null>(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [evaluation, setEvaluation] = useState<ExerciseEvaluationResponse | null>(null)
  const [generating, setGenerating] = useState(false)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingTerms, setLoadingTerms] = useState(true)

  const selectedIds = useMemo(() => new Set(selections.map((s) => s.practice_term_id)), [selections])

  useEffect(() => {
    async function loadTerms() {
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
        setPracticeTerms(data.filter((pt) => selectedIds.has(pt.id)))
      } catch {
        setError('Network error loading practice terms.')
      } finally {
        setLoadingTerms(false)
      }
    }
    loadTerms()
  }, [token, selectedIds])

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
            body: JSON.stringify({
              practice_term_id: termId,
              target_language_code: 'en',
            }),
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

  const handleTermChange = useCallback(
    (termId: string) => {
      setSelectedTermId(termId)
      if (termId) {
        generateExercise(termId)
      } else {
        setExercise(null)
        setUserAnswer('')
        setEvaluation(null)
      }
    },
    [generateExercise],
  )

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
    if (selectedTermId) {
      generateExercise(selectedTermId)
    }
  }, [selectedTermId, generateExercise])

  if (loadingTerms) {
    return <p className="text-slate-500">Loading your practice terms...</p>
  }

  return (
    <div className="space-y-6">
      <div className="rounded border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-800">Practice</h2>
          <button
            type="button"
            onClick={onOpenSelector}
            className="rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            Select terms
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <label htmlFor="practice-term-select" className="mb-1 block text-sm font-medium text-slate-700">
          Choose a term
        </label>
        <select
          id="practice-term-select"
          value={selectedTermId}
          onChange={(e) => handleTermChange(e.target.value)}
          className="mb-6 block w-full rounded border border-slate-300 px-3 py-2 text-slate-800 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        >
          <option value="">Select...</option>
          {practiceTerms.map((pt) => (
            <option key={pt.id} value={pt.id}>
              {pt.term} ({pt.term_type})
            </option>
          ))}
        </select>

        {generating && <p className="text-slate-500">Generating exercise...</p>}

        {exercise && !generating && (
          <div className="space-y-4">
            <div className="rounded bg-slate-50 p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Translate this sentence using &quot;{exercise.practice_term_text}&quot; ({exercise.term_type})
              </p>
              <p className="text-lg text-slate-800">{exercise.sentence_native}</p>
            </div>

            <div>
              <label htmlFor="prep-user-answer" className="mb-1 block text-sm font-medium text-slate-700">
                Your answer in English
              </label>
              <textarea
                id="prep-user-answer"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                disabled={!!evaluation}
                rows={3}
                placeholder="Type your sentence here..."
                className="block w-full rounded border border-slate-300 px-3 py-2 text-slate-800 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-50"
              />
            </div>

            {!evaluation && (
              <button
                type="button"
                onClick={handleCheck}
                disabled={!userAnswer.trim() || checking}
                className="rounded bg-slate-700 px-5 py-2 text-white hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {checking ? 'Checking...' : 'Check'}
              </button>
            )}

            {evaluation && (
              <div
                className={`rounded border p-4 ${
                  evaluation.is_correct
                    ? 'border-green-300 bg-green-50'
                    : 'border-amber-300 bg-amber-50'
                }`}
              >
                <p
                  className={`mb-2 text-sm font-semibold ${
                    evaluation.is_correct ? 'text-green-700' : 'text-amber-700'
                  }`}
                >
                  {evaluation.is_correct ? 'Correct!' : 'Incorrect'}
                </p>
                <p className="text-sm text-slate-700">{evaluation.feedback}</p>
                {!evaluation.is_correct && evaluation.correct_example && (
                  <p className="mt-2 text-sm text-slate-700">
                    <span className="font-medium">Correct example:</span>{' '}
                    {evaluation.correct_example}
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleNewExercise}
                  className="mt-4 rounded bg-slate-700 px-4 py-2 text-sm text-white hover:bg-slate-600"
                >
                  New Exercise
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
