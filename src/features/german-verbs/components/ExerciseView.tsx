import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/auth/context/AuthContext'
import { fetchWithAuth, germanVerbsUrl } from '@/api/client'
import { germanVerbsEndpoints } from '@/api/endpoints'
import type {
  ExerciseEvaluateResponse,
  ExerciseGenerateResponse,
  GermanVerbResponse,
  GermanVerbSelectionResponse,
} from '../types'

const TENSES = [
  { value: 'present', label: 'Present (Präsens)' },
  { value: 'past', label: 'Past (Präteritum)' },
  { value: 'future', label: 'Future (Futur I)' },
]
const PERSONS = [
  { value: '1sg', label: 'ich' },
  { value: '2sg', label: 'du' },
  { value: '3sg', label: 'er/sie/es' },
  { value: '1pl', label: 'wir' },
  { value: '2pl', label: 'ihr' },
  { value: '3pl', label: 'sie/Sie' },
]

interface ExerciseViewProps {
  selections: GermanVerbSelectionResponse[]
  onOpenSelector: () => void
}

export function ExerciseView({ selections, onOpenSelector }: ExerciseViewProps) {
  const { token } = useAuth()
  const [verbs, setVerbs] = useState<GermanVerbResponse[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [tense, setTense] = useState('present')
  const [person, setPerson] = useState('3sg')
  const [exercise, setExercise] = useState<ExerciseGenerateResponse | null>(null)
  const [answer, setAnswer] = useState('')
  const [evaluation, setEvaluation] = useState<ExerciseEvaluateResponse | null>(null)
  const [generating, setGenerating] = useState(false)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedIds = useMemo(() => new Set(selections.map((s) => s.german_verb_id)), [selections])

  useEffect(() => {
    fetchWithAuth(germanVerbsUrl(germanVerbsEndpoints.catalog.list), { method: 'GET' }, token)
      .then(async (r) => {
        if (r.ok) setVerbs((await r.json()).filter((v: GermanVerbResponse) => selectedIds.has(v.id)))
      })
  }, [token, selectedIds])

  const generate = useCallback(
    async (verbId: string, t: string, p: string) => {
      setGenerating(true)
      setExercise(null)
      setAnswer('')
      setEvaluation(null)
      try {
        const res = await fetchWithAuth(
          germanVerbsUrl(germanVerbsEndpoints.exercises.generate),
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ german_verb_id: verbId, tense: t, person: p }),
          },
          token,
        )
        if (res.ok) setExercise(await res.json())
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
        germanVerbsUrl(germanVerbsEndpoints.exercises.evaluate),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            german_verb_id: exercise.german_verb_id,
            tense: exercise.tense,
            person: exercise.person,
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
    <div className="rounded border bg-white p-6 shadow-sm">
      <div className="mb-4 flex justify-between">
        <h2 className="text-lg font-semibold">Practice conjugations</h2>
        <button type="button" onClick={onOpenSelector} className="text-sm underline">Change verbs</button>
      </div>
      <select className="mb-2 w-full rounded border px-2 py-1" value={selectedId} onChange={(e) => {
        setSelectedId(e.target.value)
        if (e.target.value) generate(e.target.value, tense, person)
      }}>
        <option value="">Verb...</option>
        {verbs.map((v) => <option key={v.id} value={v.id}>{v.infinitive}</option>)}
      </select>
      <div className="mb-4 grid grid-cols-2 gap-2">
        <select value={tense} onChange={(e) => { setTense(e.target.value); if (selectedId) generate(selectedId, e.target.value, person) }} className="rounded border px-2 py-1">
          {TENSES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <select value={person} onChange={(e) => { setPerson(e.target.value); if (selectedId) generate(selectedId, tense, e.target.value) }} className="rounded border px-2 py-1">
          {PERSONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
      </div>
      {generating && <p>Generating...</p>}
      {exercise && (
        <>
          <p className="mb-2 rounded bg-slate-50 p-3">{exercise.prompt_native}</p>
          <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} disabled={!!evaluation} className="mb-2 w-full rounded border p-2" rows={2} />
          {!evaluation && <button type="button" onClick={handleCheck} disabled={checking} className="rounded bg-slate-700 px-4 py-2 text-white">Check</button>}
          {evaluation && (
            <div className={`rounded p-3 ${evaluation.is_correct ? 'bg-green-50' : 'bg-amber-50'}`}>
              <p>{evaluation.is_correct ? 'Correct' : 'Incorrect'}: {evaluation.feedback}</p>
              <button type="button" className="mt-2 text-sm underline" onClick={() => selectedId && generate(selectedId, tense, person)}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
