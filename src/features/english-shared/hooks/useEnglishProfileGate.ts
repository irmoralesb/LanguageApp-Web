import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/auth/context/AuthContext'
import { fetchWithAuth, prepositionsUrl } from '@/api/client'
import { prepEndpoints } from '@/api/endpoints'
import type { UserProfileResponse } from '@/features/prepositions/types'

export type EnglishProfileGateView = 'loading' | 'profile-setup' | 'selection' | 'ready'

export function useEnglishProfileGate() {
  const { token } = useAuth()
  const [view, setView] = useState<EnglishProfileGateView>('loading')
  const [profile, setProfileState] = useState<UserProfileResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setError(null)
    setView('loading')
    try {
      const profileRes = await fetchWithAuth(
        prepositionsUrl(prepEndpoints.profile.get),
        { method: 'GET' },
        token,
      )
      if (profileRes.status === 404) {
        setView('profile-setup')
        return
      }
      if (!profileRes.ok) {
        setError('Failed to load profile.')
        return
      }
      setProfileState(await profileRes.json())
      setView('selection')
    } catch {
      setError('Network error. Please try again.')
    }
  }, [token])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const setProfile = useCallback((p: UserProfileResponse) => {
    setProfileState(p)
    setView('selection')
  }, [])

  const showSelection = useCallback(() => setView('selection'), [])
  const showReady = useCallback(() => setView('ready'), [])

  return { view, profile, error, refresh, setProfile, showSelection, showReady }
}
