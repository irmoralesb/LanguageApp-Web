import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/auth/context/AuthContext'
import { fetchWithAuth, germanNounsUrl } from '@/api/client'
import { germanNounsEndpoints } from '@/api/endpoints'
import type { GermanNounResponse, GermanNounSelectionResponse } from '../types'

interface NounSelectorProps {
  selections: GermanNounSelectionResponse[]
  onSelectionsUpdated: (s: GermanNounSelectionResponse[]) => void
  onStartPracticing: () => void
}

export function NounSelector({ selections, onSelectionsUpdated, onStartPracticing }: NounSelectorProps) {
  const { token } = useAuth()
  const [catalog, setCatalog] = useState<GermanNounResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const selectedIds = new Set(selections.map((s) => s.german_noun_id))

  useEffect(() => {
    fetchWithAuth(germanNounsUrl(germanNounsEndpoints.catalog.list), { method: 'GET' }, token)
      .then(async (res) => {
        if (!res.ok) throw new Error()
        setCatalog(await res.json())
      })
      .catch(() => setError('Failed to load catalog.'))
      .finally(() => setLoading(false))
  }, [token])

  const handleToggle = useCallback(
    async (nounId: string) => {
      setToggling((p) => new Set(p).add(nounId))
      try {
        if (selectedIds.has(nounId)) {
          await fetchWithAuth(germanNounsUrl(germanNounsEndpoints.profile.removeSelection(nounId)), { method: 'DELETE' }, token)
          onSelectionsUpdated(selections.filter((s) => s.german_noun_id !== nounId))
        } else {
          const res = await fetchWithAuth(
            germanNounsUrl(germanNounsEndpoints.profile.addSelection),
            { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ german_noun_id: nounId }) },
            token,
          )
          onSelectionsUpdated([...selections, await res.json()])
        }
      } catch {
        setError('Network error.')
      } finally {
        setToggling((p) => { const n = new Set(p); n.delete(nounId); return n })
      }
    },
    [selectedIds, selections, token, onSelectionsUpdated],
  )

  if (loading) return <p className="text-slate-500">Loading nouns...</p>

  return (
    <div className="rounded border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-2 text-lg font-semibold">Select nouns</h2>
      {error && <div className="mb-4 text-sm text-red-700">{error}</div>}
      <div className="mb-6 max-h-96 overflow-y-auto space-y-1">
        {catalog.map((n) => (
          <label key={n.id} className="flex gap-3 rounded px-3 py-2 hover:bg-slate-50">
            <input type="checkbox" checked={selectedIds.has(n.id)} disabled={toggling.has(n.id)} onChange={() => handleToggle(n.id)} />
            <span>
              <strong>{n.article_singular} {n.singular}</strong>
              {n.plural && <span className="text-slate-500"> / {n.article_plural ?? 'die'} {n.plural}</span>}
              <span className="ml-2 text-sm text-slate-500">{n.definition}</span>
            </span>
          </label>
        ))}
      </div>
      <button type="button" onClick={onStartPracticing} disabled={!selections.length} className="rounded bg-slate-700 px-5 py-2 text-white disabled:opacity-50">
        Start Practicing ({selections.length})
      </button>
    </div>
  )
}
