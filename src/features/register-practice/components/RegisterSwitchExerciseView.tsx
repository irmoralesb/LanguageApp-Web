import { useCallback, useState } from 'react'
import { useAuth } from '@/auth/context/AuthContext'
import { englishUrl, fetchWithAuth } from '@/api/client'
import { registerSwitchEndpoints } from '@/api/endpoints'
import type {
  RegisterOption,
  RegisterSwitchEvaluationResponse,
  RegisterSwitchExercisePromptResponse,
  SlangLevel,
} from '../types'

const REGISTERS: { id: RegisterOption; label: string }[] = [
  { id: 'formal', label: 'Formal' },
  { id: 'neutral', label: 'Neutral' },
  { id: 'casual', label: 'Casual' },
]

const SLANG_LEVELS: { id: SlangLevel; label: string }[] = [
  { id: 'light', label: 'Light slang' },
  { id: 'moderate', label: 'Moderate slang' },
  { id: 'heavy', label: 'Heavy slang' },
]

function registerLabel(value: string): string {
  return REGISTERS.find((r) => r.id === value)?.label ?? value
}

interface RegisterSwitchExerciseViewProps {
  onOpenHub?: () => void
}

export function RegisterSwitchExerciseView({ onOpenHub }: RegisterSwitchExerciseViewProps) {
  const { token } = useAuth()

  const [sourceRegister, setSourceRegister] = useState<RegisterOption | ''>('')
  const [targetRegister, setTargetRegister] = useState<RegisterOption | ''>('')
  const [slangLevel, setSlangLevel] = useState<SlangLevel | ''>('')

  const [exercise, setExercise] = useState<RegisterSwitchExercisePromptResponse | null>(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [evaluation, setEvaluation] = useState<RegisterSwitchEvaluationResponse | null>(null)
  const [generating, setGenerating] = useState(false)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateExercise = useCallback(async () => {
    setGenerating(true)
    setExercise(null)
    setUserAnswer('')
    setEvaluation(null)
    setError(null)

    const body: Record<string, string> = { target_language_code: 'en' }
    if (targetRegister) body.target_register = targetRegister
    if (targetRegister === 'casual' && slangLevel) body.slang_level = slangLevel

    try {
      const res = await fetchWithAuth(
        englishUrl(registerSwitchEndpoints.exercises.generate),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        },
        token,
      )
      if (!res.ok) {
        const errBody = await res.json().catch(() => null)
        setError(errBody?.detail ?? 'Failed to generate exercise.')
        return
      }
      const data: RegisterSwitchExercisePromptResponse = await res.json()
      setExercise(data)
      if (!sourceRegister) {
        setSourceRegister(data.source_register as RegisterOption)
      }
      if (!targetRegister) {
        setTargetRegister(data.target_register as RegisterOption)
      }
    } catch {
      setError('Network error generating exercise.')
    } finally {
      setGenerating(false)
    }
  }, [token, targetRegister, slangLevel, sourceRegister])

  const handleCheck = useCallback(async () => {
    if (!exercise || !userAnswer.trim()) return
    setChecking(true)
    setError(null)
    try {
      const res = await fetchWithAuth(
        englishUrl(registerSwitchEndpoints.exercises.evaluate),
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

  const handleNewExercise = useCallback(() => {
    void generateExercise()
  }, [generateExercise])

  const handleResetSettings = useCallback(() => {
    setSourceRegister('')
    setTargetRegister('')
    setSlangLevel('')
    setExercise(null)
    setUserAnswer('')
    setEvaluation(null)
    setError(null)
  }, [])

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-5">
        <p className="text-sm font-semibold text-teal-700">Register Practice</p>
        <h2 className="text-xl font-bold text-slate-900">Switch the register</h2>
      </div>

      {!exercise && (
        <div className="mb-5 rounded-xl border border-slate-100 bg-slate-50 p-4">
          <p className="mb-3 text-sm font-medium text-slate-700">Exercise settings</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm text-slate-600">
              Source register
              <select
                value={sourceRegister}
                onChange={(e) => setSourceRegister(e.target.value as RegisterOption | '')}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="">Any (assigned per exercise)</option>
                {REGISTERS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm text-slate-600">
              Target register
              <select
                value={targetRegister}
                onChange={(e) => {
                  const value = e.target.value as RegisterOption | ''
                  setTargetRegister(value)
                  if (value !== 'casual') setSlangLevel('')
                }}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="">Any</option>
                {REGISTERS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {targetRegister === 'casual' && (
            <label className="mt-4 block text-sm text-slate-600">
              Slang level (optional)
              <select
                value={slangLevel}
                onChange={(e) => setSlangLevel(e.target.value as SlangLevel | '')}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 sm:max-w-xs"
              >
                <option value="">Any</option>
                {SLANG_LEVELS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          )}
          {!exercise && (
            <button
              type="button"
              onClick={() => void generateExercise()}
              disabled={generating}
              className="mt-4 rounded-lg bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
            >
              {generating ? 'Generating...' : 'Start exercise'}
            </button>
          )}
        </div>
      )}

      {generating && !exercise && (
        <p className="mb-4 text-sm text-slate-500">Generating exercise...</p>
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

      {generating && exercise && (
        <p className="mb-4 text-sm text-slate-500">Generating exercise...</p>
      )}

      {exercise && !generating && (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              {registerLabel(exercise.source_register)} → {registerLabel(exercise.target_register)}
            </span>
            {exercise.slang_level && (
              <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-800">
                {exercise.slang_level} slang
              </span>
            )}
          </div>

          {exercise.scenario_native && (
            <div className="mb-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Scenario
              </p>
              <p className="text-sm text-slate-700">{exercise.scenario_native}</p>
            </div>
          )}

          <div className="mb-4 rounded-xl border border-teal-100 bg-teal-50 p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-teal-700">
              Source sentence ({registerLabel(exercise.source_register)})
            </p>
            <p className="text-base font-medium text-slate-900">{exercise.source_sentence}</p>
          </div>

          <label htmlFor="register-switch-answer" className="mb-1 block text-sm font-medium text-slate-700">
            Rewrite in {registerLabel(exercise.target_register)} register
          </label>
          <textarea
            id="register-switch-answer"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            disabled={!!evaluation}
            rows={4}
            placeholder="Write your rewrite..."
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
                {evaluation.is_correct ? 'Well done!' : 'Keep practicing'}
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
            <div className="mt-6 flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-between">
              <div className="flex flex-col gap-2 sm:flex-row">
                {onOpenHub && (
                  <button
                    type="button"
                    onClick={onOpenHub}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Choose exercise
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleResetSettings}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  Change settings
                </button>
              </div>
              <button
                type="button"
                onClick={handleNewExercise}
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
