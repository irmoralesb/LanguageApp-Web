import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/auth/context/AuthContext'
import { fetchWithAuth, germanVerbsUrl } from '@/api/client'
import { germanVerbsEndpoints } from '@/api/endpoints'
import type { GermanVerbSelectionResponse, UserProfileResponse } from '../types'

export type GermanVerbsGateView = 'loading' | 'profile-setup' | 'selection' | 'ready'

export function useGermanVerbsGate() {
  const { token } = useAuth()
  const [view, setView] = useState<GermanVerbsGateView>('loading')
  const [profile, setProfile] = useState<UserProfileResponse | null>(null)
  const [selections, setSelections] = useState<GermanVerbSelectionResponse[]>([])
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setError(null)
    setView('loading')
    try {
      const pr = await fetchWithAuth(germanVerbsUrl(germanVerbsEndpoints.profile.get), { method: 'GET' }, token)
      if (pr.status === 404) { setView('profile-setup'); return }
      if (!pr.ok) { setError('Failed to load profile.'); return }
      setProfile(await pr.json())
      const sr = await fetchWithAuth(germanVerbsUrl(germanVerbsEndpoints.profile.selections), { method: 'GET' }, token)
      if (!sr.ok) { setError('Failed to load selections.'); return }
      const sel: GermanVerbSelectionResponse[] = await sr.json()
      setSelections(sel)
      setView(sel.length ? 'ready' : 'selection')
    } catch {
      setError('Network error.')
    }
  }, [token])

  useEffect(() => { refresh() }, [refresh])

  return {
    view, profile, selections, error, refresh,
    setProfile: (p: UserProfileResponse) => { setProfile(p); setView('selection') },
    setSelections,
    showSelection: () => setView('selection'),
    showReady: () => setView('ready'),
  }
}
