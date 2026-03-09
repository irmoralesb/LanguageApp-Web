import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/auth/context/AuthContext'
import { fetchWithAuth, phrasalVerbsUrl } from '@/api/client'
import { pvEndpoints } from '@/api/endpoints'
import type { PhrasalVerbResponse, PhrasalVerbSelectionResponse } from '../types'

interface PhrasalVerbSelectorProps {
  selections: PhrasalVerbSelectionResponse[]
  onSelectionsUpdated: (selections: PhrasalVerbSelectionResponse[]) => void
  onStartPracticing: () => void
}

export function PhrasalVerbSelector({
  selections,
  onSelectionsUpdated,
  onStartPracticing,
}: PhrasalVerbSelectorProps) {
  const { token } = useAuth()
  const [catalog, setCatalog] = useState<PhrasalVerbResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  const selectedIds = new Set(selections.map((s) => s.phrasal_verb_id))

  useEffect(() => {
    async function loadCatalog() {
      try {
        const res = await fetchWithAuth(
          phrasalVerbsUrl(pvEndpoints.phrasalVerbs.catalog),
          { method: 'GET' },
          token,
        )
        if (!res.ok) {
          setError('Failed to load phrasal verbs catalog.')
          return
        }
        const data: PhrasalVerbResponse[] = await res.json()
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
    async (phrasalVerbId: string) => {
      setToggling((prev) => new Set(prev).add(phrasalVerbId))
      setError(null)

      try {
        if (selectedIds.has(phrasalVerbId)) {
          const res = await fetchWithAuth(
            phrasalVerbsUrl(pvEndpoints.profile.removeSelection(phrasalVerbId)),
            { method: 'DELETE' },
            token,
          )
          if (!res.ok) {
            setError('Failed to remove selection.')
            return
          }
          onSelectionsUpdated(selections.filter((s) => s.phrasal_verb_id !== phrasalVerbId))
        } else {
          const res = await fetchWithAuth(
            phrasalVerbsUrl(pvEndpoints.profile.addSelection),
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ phrasal_verb_id: phrasalVerbId }),
            },
            token,
          )
          if (!res.ok) {
            setError('Failed to add selection.')
            return
          }
          const newSelection: PhrasalVerbSelectionResponse = await res.json()
          onSelectionsUpdated([...selections, newSelection])
        }
      } catch {
        setError('Network error. Please try again.')
      } finally {
        setToggling((prev) => {
          const next = new Set(prev)
          next.delete(phrasalVerbId)
          return next
        })
      }
    },
    [selectedIds, selections, token, onSelectionsUpdated],
  )

  if (loading) {
    return <p className="text-slate-500">Loading phrasal verbs...</p>
  }

  return (
    <div className="rounded border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-2 text-lg font-semibold text-slate-800">Select Phrasal Verbs</h2>
      <p className="mb-6 text-slate-600">
        Choose the phrasal verbs you want to practice. You can change your selection at any time.
      </p>

      {error && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {catalog.length === 0 ? (
        <p className="text-slate-500">No phrasal verbs available in the catalog yet.</p>
      ) : (
        <div className="mb-6 max-h-96 space-y-1 overflow-y-auto">
          {catalog.map((pv) => {
            const isSelected = selectedIds.has(pv.id)
            const isToggling = toggling.has(pv.id)
            return (
              <label
                key={pv.id}
                className={`flex cursor-pointer items-start gap-3 rounded px-3 py-2 transition-colors ${
                  isSelected ? 'bg-slate-100' : 'hover:bg-slate-50'
                } ${isToggling ? 'opacity-60' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  disabled={isToggling}
                  onChange={() => handleToggle(pv.id)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-700 focus:ring-slate-500"
                />
                <div className="min-w-0">
                  <span className="font-medium text-slate-800">
                    {pv.verb} {pv.particle}
                  </span>
                  <span className="ml-2 text-sm text-slate-500">{pv.definition}</span>
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
          {selections.length} phrasal verb{selections.length !== 1 ? 's' : ''} selected
        </span>
      </div>
    </div>
  )
}
