import { useCallback, useMemo, useState } from 'react'
import { useAuth } from '@/auth/context/AuthContext'
import { fetchWithAuth, germanNounsUrl } from '@/api/client'
import { germanNounsEndpoints } from '@/api/endpoints'
import type {
  GermanNounGenderArticle,
  NounGenderExerciseEvaluateResponse,
  NounGenderExerciseGenerateResponse,
  NounGenderExerciseItem,
} from '../types'

interface GenderExerciseViewProps {
  onOpenSelector: () => void
}

type ExerciseStatus = 'setup' | 'playing' | 'won' | 'lost'

interface NounCard extends NounGenderExerciseItem {
  cardId: string
}

const ARTICLES: GermanNounGenderArticle[] = ['der', 'die', 'das']

function createCardId(nounId: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${nounId}-${crypto.randomUUID()}`
  }
  return `${nounId}-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function toCards(nouns: NounGenderExerciseItem[]): NounCard[] {
  return nouns.map((noun) => ({ ...noun, cardId: createCardId(noun.german_noun_id) }))
}

export function GenderExerciseView({ onOpenSelector }: GenderExerciseViewProps) {
  const { token } = useAuth()
  const [targetScore, setTargetScore] = useState(10)
  const [score, setScore] = useState(0)
  const [cards, setCards] = useState<NounCard[]>([])
  const [status, setStatus] = useState<ExerciseStatus>('setup')
  const [loading, setLoading] = useState(false)
  const [submittingCardId, setSubmittingCardId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const statusText = useMemo(() => {
    if (status === 'won') return `You won with ${score} points.`
    if (status === 'lost') return 'Game over. Your score went below 0.'
    return `Reach ${targetScore} points before your score drops below 0.`
  }, [score, status, targetScore])

  const loadCards = useCallback(
    async (count = 9) => {
      const res = await fetchWithAuth(
        germanNounsUrl(germanNounsEndpoints.exercises.gender.generate),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ target_score: targetScore, count }),
        },
        token,
      )
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.detail ?? 'Failed to load noun cards.')
      }
      const data: NounGenderExerciseGenerateResponse = await res.json()
      return toCards(data.nouns)
    },
    [targetScore, token],
  )

  const startExercise = useCallback(async () => {
    setLoading(true)
    setError(null)
    setFeedback(null)
    try {
      const nextCards = await loadCards()
      setCards(nextCards)
      setScore(0)
      setStatus('playing')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start exercise.')
    } finally {
      setLoading(false)
    }
  }, [loadCards])

  const resetExercise = useCallback(() => {
    setStatus('setup')
    setCards([])
    setScore(0)
    setFeedback(null)
    setError(null)
  }, [])

  const evaluateDrop = useCallback(
    async (cardId: string, selectedArticle: GermanNounGenderArticle) => {
      if (status !== 'playing' || submittingCardId) return
      const card = cards.find((item) => item.cardId === cardId)
      if (!card) return

      setSubmittingCardId(cardId)
      setError(null)
      try {
        const res = await fetchWithAuth(
          germanNounsUrl(germanNounsEndpoints.exercises.gender.evaluate),
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              german_noun_id: card.german_noun_id,
              selected_article: selectedArticle,
            }),
          },
          token,
        )
        if (!res.ok) {
          const body = await res.json().catch(() => null)
          setError(body?.detail ?? 'Failed to check noun.')
          return
        }

        const result: NounGenderExerciseEvaluateResponse = await res.json()
        const nextScore = score + (result.is_correct ? 1 : -1)
        const remainingCards = cards.filter((item) => item.cardId !== cardId)
        const repeatedCard = result.is_correct ? [] : [{ ...card, cardId: createCardId(card.german_noun_id) }]
        let nextCards = [...remainingCards, ...repeatedCard]
        let nextStatus: ExerciseStatus = 'playing'

        if (nextScore >= targetScore) {
          nextStatus = 'won'
        } else if (nextScore < 0) {
          nextStatus = 'lost'
        } else if (nextCards.length < 4) {
          nextCards = [...nextCards, ...(await loadCards(6))]
        }

        setScore(nextScore)
        setCards(nextCards)
        setStatus(nextStatus)
        setFeedback(result.feedback)
      } catch {
        setError('Network error checking noun.')
      } finally {
        setSubmittingCardId(null)
      }
    },
    [cards, loadCards, score, status, submittingCardId, targetScore, token],
  )

  const handleDrop = (article: GermanNounGenderArticle, cardId: string) => {
    evaluateDrop(cardId, article)
  }

  if (status === 'setup') {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <p className="text-sm font-semibold text-indigo-700">German Noun Genders</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-900">Sort nouns by article</h2>
        <p className="mt-2 text-sm text-slate-600">
          Drag each singular catalog noun into Der, Die, or Das. Correct drops add 1 point;
          incorrect drops subtract 1 point and are recorded for future practice.
        </p>

        {error && (
          <div className="mt-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <label className="mt-6 block max-w-xs text-sm font-medium text-slate-700">
          Score to win
          <input
            type="number"
            min={1}
            max={50}
            value={targetScore}
            onChange={(event) => setTargetScore(Number(event.target.value))}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </label>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={startExercise}
            disabled={loading || targetScore < 1}
            className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Loading nouns...' : 'Start exercise'}
          </button>
          <button
            type="button"
            onClick={onOpenSelector}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Manage saved nouns
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-indigo-700">German Noun Genders</p>
          <h2 className="text-xl font-bold text-slate-900">Drag each noun to its article</h2>
          <p className="mt-1 text-sm text-slate-600">{statusText}</p>
        </div>
        <div className="rounded-xl bg-slate-100 px-4 py-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Score</p>
          <p className="text-2xl font-bold text-slate-900">{score}</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {feedback && (
        <div className="mb-4 rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-sm text-indigo-900">
          {feedback}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-3">
        {ARTICLES.map((article) => (
          <section
            key={article}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault()
              handleDrop(article, event.dataTransfer.getData('text/plain'))
            }}
            className="min-h-36 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-4"
          >
            <h3 className="text-center text-2xl font-bold capitalize text-slate-900">{article}</h3>
            <p className="mt-2 text-center text-xs text-slate-500">Drop nouns here</p>
          </section>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold text-slate-900">Nouns</h3>
          <p className="text-xs text-slate-500">
            Failed nouns can come back in this round and will appear more often later.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {cards.map((card) => (
            <div
              key={card.cardId}
              draggable={status === 'playing' && submittingCardId !== card.cardId}
              onDragStart={(event) => event.dataTransfer.setData('text/plain', card.cardId)}
              className={`rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm ${
                submittingCardId === card.cardId ? 'opacity-50' : ''
              }`}
            >
              <p className="font-semibold text-slate-900">{card.singular}</p>
              <p className="mt-1 max-w-52 text-xs text-slate-500">{card.definition}</p>
              <div className="mt-3 flex gap-1 md:hidden">
                {ARTICLES.map((article) => (
                  <button
                    key={article}
                    type="button"
                    onClick={() => evaluateDrop(card.cardId, article)}
                    disabled={status !== 'playing' || !!submittingCardId}
                    className="rounded-full bg-white px-2 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200 disabled:opacity-50"
                  >
                    {article}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {(status === 'won' || status === 'lost') && (
        <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={resetExercise}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Change target
          </button>
          <button
            type="button"
            onClick={startExercise}
            className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Play again
          </button>
        </div>
      )}
    </div>
  )
}
