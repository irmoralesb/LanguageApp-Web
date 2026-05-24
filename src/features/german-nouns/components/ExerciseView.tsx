import { useCallback, useEffect, useMemo, useState } from 'react'
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

export function ExerciseView({ selections, onOpenSelector }: ExerciseViewProps) {
  const { token } = useAuth()
  const [nouns, setNouns] = useState<GermanNounResponse[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [mode, setMode] = useState<'singular' | 'plural'>('singular')
  const [exercise, setExercise] = useState<ExerciseGenerateResponse | null>(null)
  const [answer, setAnswer] = useState('')
  const [evaluation, setEvaluation] = useState<ExerciseEvaluateResponse | null>(null)
  const [generating, setGenerating] = useState(false)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedIds = useMemo(() => new Set(selections.map((s) => s.german_noun_id)), [selections])

  useEffect(() => {
    fetchWithAuth(germanNounsUrl(germanNounsEndpoints.catalog.list), { method: 'GET' }, token)
      .then(async (r) => r.ok && setNouns((await r.json()).filter((n: GermanNounResponse) => selectedIds.has(n.id))))
      .catch(() => setError('Failed to load nouns.'))
  }, [token, selectedIds])

  const generate = useCallback(
    async (nounId: string, exerciseMode: 'singular' | 'plural') => {
      setGenerating(true)
      setExercise(null)
      setAnswer('')
      setEvaluation(null)
      setError(null)
      try {
        const res = await fetchWithAuth(
          germanNounsUrl(germanNounsEndpoints.exercises.generate),
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ german_noun_id: nounId, exercise_mode: exerciseMode }),
          },
          token,
        )
        if (!res.ok) {
          setError('Failed to generate exercise.')
          return
        }
        setExercise(await res.json())
      } catch {
        setError('Network error.')
      } finally {
        setGenerating(false)
      }
    },
    [token],
  )

  const handleCheck = useCallback(async () => {
    if (!exercise || !answer.trim()) return
    setChecking(true)
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
            user_answer: answer.trim(),
          }),
        },
        token,
      )
      if (res.ok) setEvaluation(await res.json())
    } finally {
      setChecking(false)
    }
  }, [exercise, answer, token])

  return (
    <div className="rounded border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex justify-between">
        <h2 className="text-lg font-semibold">Practice German nouns</h2>
        <button type="button" onClick={onOpenSelector} className="text-sm underline">Change selection</button>
      </div>
      {error && <div className="mb-4 text-sm text-red-700">{error}</div>}
      <label className="block text-sm font-medium">Noun</label>
      <select
        value={selectedId}
        onChange={(e) => {
          setSelectedId(e.target.value)
          if (e.target.value) generate(e.target.value, mode)
        }}
        className="mb-4 block w-full rounded border px-3 py-2"
      >
        <option value="">Select...</option>
        {nouns.map((n) => (
          <option key={n.id} value={n.id}>{n.article_singular} {n.singular}</option>
        ))}
      </select>
      <label className="block text-sm font-medium">Mode</label>
      <select
        value={mode}
        onChange={(e) => {
          const m = e.target.value as 'singular' | 'plural'
          setMode(m)
          if (selectedId) generate(selectedId, m)
        }}
        className="mb-4 block w-full rounded border px-3 py-2"
      >
        <option value="singular">Singular with article</option>
        <option value="plural">Plural with article</option>
      </select>
      {generating && <p>Generating...</p>}
      {exercise && !generating && (
        <>
          <p className="mb-2 rounded bg-slate-50 p-3">{exercise.prompt_native}</p>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={!!evaluation}
            rows={2}
            placeholder="Write in German (e.g. der Hund)"
            className="mb-4 w-full rounded border px-3 py-2"
          />
          {!evaluation && (
            <button type="button" onClick={handleCheck} disabled={checking} className="rounded bg-slate-700 px-4 py-2 text-white">
              {checking ? 'Checking...' : 'Check'}
            </button>
          )}
          {evaluation && (
            <div className={`rounded p-4 ${evaluation.is_correct ? 'bg-green-50' : 'bg-amber-50'}`}>
              <p className="font-semibold">{evaluation.is_correct ? 'Correct' : 'Incorrect'}</p>
              <p className="text-sm">{evaluation.feedback}</p>
              <button type="button" className="mt-3 text-sm underline" onClick={() => selectedId && generate(selectedId, mode)}>
                Next exercise
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
