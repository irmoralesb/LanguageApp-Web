import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '@/auth/context/AuthContext'
import { fetchWithAuth, phrasalVerbsUrl } from '@/api/client'
import { pvEndpoints } from '@/api/endpoints'
import type {
  ExerciseEvaluationResponse,
  ExercisePromptResponse,
  PhrasalVerbResponse,
  PhrasalVerbSelectionResponse,
  UserProfileResponse,
} from '../types'

interface ExerciseViewProps {
  profile: UserProfileResponse
  selections: PhrasalVerbSelectionResponse[]
  onOpenSelector: () => void
}

export function ExerciseView({ selections, onOpenSelector }: ExerciseViewProps) {
  const { token } = useAuth()

  const [phrasalVerbs, setPhrasalVerbs] = useState<PhrasalVerbResponse[]>([])
  const [exercise, setExercise] = useState<ExercisePromptResponse | null>(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [evaluation, setEvaluation] = useState<ExerciseEvaluationResponse | null>(null)
  const [attempt, setAttempt] = useState<1 | 2>(1)
  const [showHint, setShowHint] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingVerbs, setLoadingVerbs] = useState(true)

  const selectedPvIds = useMemo(() => new Set(selections.map((s) => s.phrasal_verb_id)), [selections])
  const initialGenerated = useRef(false)

  const generateExercise = useCallback(
    async (verbId: string) => {
      setGenerating(true)
      setExercise(null)
      setUserAnswer('')
      setEvaluation(null)
      setAttempt(1)
      setShowHint(false)
      setError(null)
      try {
        const res = await fetchWithAuth(
          phrasalVerbsUrl(pvEndpoints.exercises.generate),
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phrasal_verb_id: verbId, target_language_code: 'en' }),
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

  const pickRandom = useCallback(
    (verbs: PhrasalVerbResponse[]) => {
      if (verbs.length === 0) return
      const randomId = verbs[Math.floor(Math.random() * verbs.length)].id
      generateExercise(randomId)
    },
    [generateExercise],
  )

  useEffect(() => {
    async function loadAndStart() {
      try {
        const res = await fetchWithAuth(
          phrasalVerbsUrl(pvEndpoints.phrasalVerbs.catalog),
          { method: 'GET' },
          token,
        )
        if (!res.ok) {
          setError('Failed to load phrasal verbs.')
          return
        }
        const data: PhrasalVerbResponse[] = await res.json()
        const filtered = data.filter((pv) => selectedPvIds.has(pv.id))
        setPhrasalVerbs(filtered)
        if (filtered.length > 0 && !initialGenerated.current) {
          initialGenerated.current = true
          const randomId = filtered[Math.floor(Math.random() * filtered.length)].id
          generateExercise(randomId)
        }
      } catch {
        setError('Network error loading phrasal verbs.')
      } finally {
        setLoadingVerbs(false)
      }
    }
    loadAndStart()
  }, [token, selectedPvIds, generateExercise])

  const handleCheck = useCallback(async () => {
    if (!exercise || !userAnswer.trim()) return
    setChecking(true)
    setError(null)
    try {
      const res = await fetchWithAuth(
        phrasalVerbsUrl(pvEndpoints.exercises.evaluate),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phrasal_verb_id: exercise.phrasal_verb_id,
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

  const handleRetry = useCallback(() => {
    setAttempt(2)
    setUserAnswer('')
    setEvaluation(null)
    setShowHint(false)
  }, [])

  const handleNewExercise = useCallback(() => {
    pickRandom(phrasalVerbs)
  }, [phrasalVerbs, pickRandom])

  if (loadingVerbs || (generating && !exercise)) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-slate-500">{loadingVerbs ? 'Loading your phrasal verbs...' : 'Generating exercise...'}</p>
      </div>
    )
  }

  if (phrasalVerbs.length === 0) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
        <p className="font-medium">No phrasal verbs selected.</p>
        <button
          type="button"
          onClick={onOpenSelector}
          className="mt-3 rounded-lg bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700"
        >
          Select phrasal verbs
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-teal-700">Phrasal Verbs Practice</p>
          <h2 className="text-xl font-bold text-slate-900">Translate the sentence</h2>
        </div>
        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {phrasalVerbs.length} saved verb{phrasalVerbs.length !== 1 ? 's' : ''} in rotation
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {generating && (
        <p className="text-sm text-slate-500">Generating exercise...</p>
      )}

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
              Sentence
            </p>
            <p className="text-lg font-medium text-slate-900">{exercise.sentence_native}</p>
          </div>

          {showHint && (
            <div className="mt-3 rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900">
              Phrasal verb: <strong>{exercise.phrasal_verb_text}</strong>
            </div>
          )}

          <label
            htmlFor="phrasal-answer"
            className="mb-1 mt-5 block text-sm font-medium text-slate-700"
          >
            Your answer in English
          </label>
          <textarea
            id="phrasal-answer"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            disabled={!!evaluation}
            rows={4}
            placeholder="Type your sentence here..."
            className="block w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-800 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-50"
          />

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => setShowHint((v) => !v)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              {showHint ? 'Hide hint' : 'Show hint'}
            </button>
            {!evaluation && (
              <button
                type="button"
                onClick={handleCheck}
                disabled={!userAnswer.trim() || checking}
                className="rounded-lg bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {checking ? 'Checking...' : attempt === 1 ? 'Check answer' : 'Submit retry'}
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
                {evaluation.is_correct ? 'Correct!' : `Attempt ${attempt}: Not yet`}
              </p>
              <p className="text-sm text-slate-700">{evaluation.feedback}</p>
              {!evaluation.is_correct && evaluation.correct_example && attempt === 2 && (
                <div className="mt-3 rounded-lg bg-white p-3 text-sm text-slate-700">
                  <span className="font-medium">Correct example:</span> {evaluation.correct_example}
                </div>
              )}
              {!evaluation.is_correct && attempt === 1 && (
                <button
                  type="button"
                  onClick={handleRetry}
                  className="mt-4 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
                >
                  Retry once
                </button>
              )}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={onOpenSelector}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Change saved verbs
            </button>
            {(evaluation?.is_correct || (evaluation && attempt === 2)) && (
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
