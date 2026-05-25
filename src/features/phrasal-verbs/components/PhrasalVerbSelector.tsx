import { useCallback, useEffect, useMemo, useState } from 'react'
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
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const selectedIds = useMemo(
    () => new Set(selections.map((s) => s.phrasal_verb_id)),
    [selections],
  )

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

  const filteredCatalog = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return catalog
    return catalog.filter((pv) =>
      [`${pv.verb} ${pv.particle}`, pv.definition].some((v) => v.toLowerCase().includes(q)),
    )
  }, [catalog, searchTerm])

  const handleToggle = useCallback(
    async (phrasalVerbId: string, currentSelectedIds: Set<string>, currentSelections: PhrasalVerbSelectionResponse[]) => {
      setToggling((prev) => new Set(prev).add(phrasalVerbId))
      setError(null)
      try {
        if (currentSelectedIds.has(phrasalVerbId)) {
          const res = await fetchWithAuth(
            phrasalVerbsUrl(pvEndpoints.profile.removeSelection(phrasalVerbId)),
            { method: 'DELETE' },
            token,
          )
          if (!res.ok) {
            setError('Failed to remove selection.')
            return
          }
          onSelectionsUpdated(currentSelections.filter((s) => s.phrasal_verb_id !== phrasalVerbId))
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
          const newSel: PhrasalVerbSelectionResponse = await res.json()
          onSelectionsUpdated([...currentSelections, newSel])
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
    [token, onSelectionsUpdated],
  )

  const handleSelectAll = useCallback(async () => {
    const toAdd = filteredCatalog.filter((pv) => !selectedIds.has(pv.id))
    if (toAdd.length === 0) return
    setError(null)
    const ids = toAdd.map((pv) => pv.id)
    setToggling((prev) => {
      const next = new Set(prev)
      ids.forEach((id) => next.add(id))
      return next
    })
    const newSelections: PhrasalVerbSelectionResponse[] = []
    for (const pv of toAdd) {
      try {
        const res = await fetchWithAuth(
          phrasalVerbsUrl(pvEndpoints.profile.addSelection),
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phrasal_verb_id: pv.id }),
          },
          token,
        )
        if (res.ok) {
          const sel: PhrasalVerbSelectionResponse = await res.json()
          newSelections.push(sel)
        }
      } catch { /* continue */ }
    }
    onSelectionsUpdated([...selections, ...newSelections])
    setToggling((prev) => {
      const next = new Set(prev)
      ids.forEach((id) => next.delete(id))
      return next
    })
  }, [filteredCatalog, selectedIds, selections, token, onSelectionsUpdated])

  const handleClearAll = useCallback(async () => {
    const toRemove = filteredCatalog.filter((pv) => selectedIds.has(pv.id))
    if (toRemove.length === 0) return
    setError(null)
    const ids = toRemove.map((pv) => pv.id)
    setToggling((prev) => {
      const next = new Set(prev)
      ids.forEach((id) => next.add(id))
      return next
    })
    const removedIds = new Set<string>()
    for (const pv of toRemove) {
      try {
        const res = await fetchWithAuth(
          phrasalVerbsUrl(pvEndpoints.profile.removeSelection(pv.id)),
          { method: 'DELETE' },
          token,
        )
        if (res.ok) removedIds.add(pv.id)
      } catch { /* continue */ }
    }
    onSelectionsUpdated(selections.filter((s) => !removedIds.has(s.phrasal_verb_id)))
    setToggling((prev) => {
      const next = new Set(prev)
      ids.forEach((id) => next.delete(id))
      return next
    })
  }, [filteredCatalog, selectedIds, selections, token, onSelectionsUpdated])

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (loading) {
    return <p className="text-slate-500">Loading phrasal verbs...</p>
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-sm font-semibold text-teal-700">Saved to your profile</p>
        <h2 className="text-xl font-bold text-slate-900">Choose phrasal verbs to practice</h2>
        <p className="mt-1 text-sm text-slate-600">Selection persists across sessions.</p>

        {error && (
          <div className="mt-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <label className="min-w-0 flex-1 text-sm font-medium text-slate-700">
            Search phrasal verbs
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by verb or definition..."
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
            >
              Select all
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="mb-3 mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            Showing {filteredCatalog.length} of {catalog.length} phrasal verbs
          </span>
          <span>{selections.length} selected</span>
        </div>

        <div className="max-h-[32rem] overflow-y-auto rounded-xl border border-slate-200 bg-white">
          {filteredCatalog.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-slate-500">
              No phrasal verbs match your search.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {filteredCatalog.map((pv) => {
                const isSelected = selectedIds.has(pv.id)
                const isBusy = toggling.has(pv.id)
                const isExpanded = expandedIds.has(pv.id)
                return (
                  <li
                    key={pv.id}
                    className={`transition ${isBusy ? 'opacity-60' : ''} ${
                      isSelected ? 'border-teal-400 bg-teal-50' : 'border-transparent hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 px-3 py-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={isBusy}
                        onChange={() => handleToggle(pv.id, selectedIds, selections)}
                        className="h-4 w-4 shrink-0 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        aria-label={`Select ${pv.verb} ${pv.particle}`}
                      />
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-slate-900">
                          {pv.verb} {pv.particle}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleExpanded(pv.id)}
                        className="shrink-0 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-white"
                        aria-expanded={isExpanded}
                      >
                        {isExpanded ? 'Hide' : 'Definition'}
                      </button>
                    </div>
                    {isExpanded && (
                      <div className="border-t border-slate-100 bg-white/70 px-10 pb-3 pt-2 text-sm text-slate-600">
                        {pv.definition}
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>

      <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="font-semibold text-slate-900">Practice options</h3>
        <p className="mt-2 rounded-xl border border-teal-100 bg-teal-50 p-3 text-sm text-teal-900">
          {selections.length} verb{selections.length !== 1 ? 's' : ''} selected. Used in random rotation during practice.
        </p>
        <button
          type="button"
          onClick={onStartPracticing}
          disabled={selections.length === 0}
          className="mt-4 w-full rounded-lg bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Start practice
        </button>
      </aside>
    </div>
  )
}
