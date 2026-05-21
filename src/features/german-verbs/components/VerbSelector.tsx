import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/auth/context/AuthContext'
import { fetchWithAuth, germanVerbsUrl } from '@/api/client'
import { germanVerbsEndpoints } from '@/api/endpoints'
import type { GermanVerbResponse, GermanVerbSelectionResponse } from '../types'

interface VerbSelectorProps {
  selections: GermanVerbSelectionResponse[]
  onSelectionsUpdated: (s: GermanVerbSelectionResponse[]) => void
  onStartPracticing: () => void
}

export function VerbSelector({ selections, onSelectionsUpdated, onStartPracticing }: VerbSelectorProps) {
  const { token } = useAuth()
  const [catalog, setCatalog] = useState<GermanVerbResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const selectedIds = new Set(selections.map((s) => s.german_verb_id))

  useEffect(() => {
    fetchWithAuth(germanVerbsUrl(germanVerbsEndpoints.catalog.list), { method: 'GET' }, token)
      .then(async (r) => { if (r.ok) setCatalog(await r.json()) })
      .catch(() => setError('Failed to load verbs.'))
      .finally(() => setLoading(false))
  }, [token])

  const toggle = useCallback(async (id: string) => {
    try {
      if (selectedIds.has(id)) {
        await fetchWithAuth(germanVerbsUrl(germanVerbsEndpoints.profile.removeSelection(id)), { method: 'DELETE' }, token)
        onSelectionsUpdated(selections.filter((s) => s.german_verb_id !== id))
      } else {
        const res = await fetchWithAuth(
          germanVerbsUrl(germanVerbsEndpoints.profile.addSelection),
          { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ german_verb_id: id }) },
          token,
        )
        onSelectionsUpdated([...selections, await res.json()])
      }
    } catch {
      setError('Network error.')
    }
  }, [selectedIds, selections, token, onSelectionsUpdated])

  if (loading) return <p>Loading verbs...</p>

  return (
    <div className="rounded border bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">Select verbs</h2>
      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
      <div className="mb-4 max-h-96 overflow-y-auto space-y-1">
        {catalog.map((v) => (
          <label key={v.id} className="flex gap-2 rounded px-2 py-1 hover:bg-slate-50">
            <input type="checkbox" checked={selectedIds.has(v.id)} onChange={() => toggle(v.id)} />
            <span><strong>{v.infinitive}</strong> â€” {v.definition}</span>
          </label>
        ))}
      </div>
      <button type="button" disabled={!selections.length} onClick={onStartPracticing} className="rounded bg-slate-700 px-4 py-2 text-white disabled:opacity-50">
        Start ({selections.length})
      </button>
    </div>
  )
}
