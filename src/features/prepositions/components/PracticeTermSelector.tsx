import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/auth/context/AuthContext'
import { fetchWithAuth, prepositionsUrl } from '@/api/client'
import { prepEndpoints } from '@/api/endpoints'
import type { PracticeTermResponse, PracticeTermSelectionResponse } from '../types'

interface PracticeTermSelectorProps {
  selections: PracticeTermSelectionResponse[]
  onSelectionsUpdated: (selections: PracticeTermSelectionResponse[]) => void
  onStartPracticing: () => void
}

export function PracticeTermSelector({
  selections,
  onSelectionsUpdated,
  onStartPracticing,
}: PracticeTermSelectorProps) {
  const { token } = useAuth()
  const [catalog, setCatalog] = useState<PracticeTermResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  const selectedIds = new Set(selections.map((s) => s.practice_term_id))

  useEffect(() => {
    async function loadCatalog() {
      try {
        const res = await fetchWithAuth(
          prepositionsUrl(prepEndpoints.practiceTerms.catalog),
          { method: 'GET' },
          token,
        )
        if (!res.ok) {
          setError('Failed to load practice terms catalog.')
          return
        }
        const data: PracticeTermResponse[] = await res.json()
        setCatalog(data)
      } catch {
        setError('Network error loading catalog.')
      } finally {
        setLoading(false)
      }
    }
    loadCatalog()
  }, [token])

  const handleToggle = useCallback(
    async (practiceTermId: string) => {
      setToggling((prev) => new Set(prev).add(practiceTermId))
      setError(null)

      try {
        if (selectedIds.has(practiceTermId)) {
          const res = await fetchWithAuth(
            prepositionsUrl(prepEndpoints.profile.removeSelection(practiceTermId)),
            { method: 'DELETE' },
            token,
          )
          if (!res.ok) {
            setError('Failed to remove selection.')
            return
          }
          onSelectionsUpdated(selections.filter((s) => s.practice_term_id !== practiceTermId))
        } else {
          const res = await fetchWithAuth(
            prepositionsUrl(prepEndpoints.profile.addSelection),
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ practice_term_id: practiceTermId }),
            },
            token,
          )
          if (!res.ok) {
            setError('Failed to add selection.')
            return
          }
          const newSelection: PracticeTermSelectionResponse = await res.json()
          onSelectionsUpdated([...selections, newSelection])
        }
      } catch {
        setError('Network error. Please try again.')
      } finally {
        setToggling((prev) => {
          const next = new Set(prev)
          next.delete(practiceTermId)
          return next
        })
      }
    },
    [selectedIds, selections, token, onSelectionsUpdated],
  )

  if (loading) {
    return <p className="text-slate-500">Loading practice terms...</p>
  }

  return (
    <div className="rounded border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-2 text-lg font-semibold text-slate-800">Select terms</h2>
      <p className="mb-6 text-slate-600">
        Choose the prepositions or terms you want to practice. You can change your selection at any time.
      </p>

      {error && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {catalog.length === 0 ? (
        <p className="text-slate-500">No practice terms available in the catalog yet.</p>
      ) : (
        <div className="mb-6 max-h-96 space-y-1 overflow-y-auto">
          {catalog.map((pt) => {
            const isSelected = selectedIds.has(pt.id)
            const busy = toggling.has(pt.id)
            return (
              <label
                key={pt.id}
                className={`flex cursor-pointer items-start gap-3 rounded px-3 py-2 transition-colors ${
                  isSelected ? 'bg-slate-100' : 'hover:bg-slate-50'
                } ${busy ? 'opacity-60' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  disabled={busy}
                  onChange={() => handleToggle(pt.id)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-700 focus:ring-slate-500"
                />
                <div className="min-w-0">
                  <span className="font-medium text-slate-800">
                    {pt.term}{' '}
                    <span className="text-sm font-normal text-slate-500">({pt.term_type})</span>
                  </span>
                  <span className="ml-2 text-sm text-slate-500">{pt.definition}</span>
                </div>
              </label>
            )
          })}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onStartPracticing}
          disabled={selections.length === 0}
          className="rounded bg-slate-700 px-5 py-2 text-white hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Start Practicing
        </button>
        <span className="text-sm text-slate-500">
          {selections.length} term{selections.length !== 1 ? 's' : ''} selected
        </span>
      </div>
    </div>
  )
}
