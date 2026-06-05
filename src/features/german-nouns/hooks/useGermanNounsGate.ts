import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/auth/context/AuthContext'
import { fetchWithAuth, germanNounsUrl } from '@/api/client'
import { germanNounsEndpoints } from '@/api/endpoints'
import type { GermanNounSelectionResponse, UserProfileResponse } from '../types'

export type GermanNounsGateView = 'loading' | 'profile-setup' | 'selection' | 'ready'

export function useGermanNounsGate() {
  const { token } = useAuth()
  const [view, setView] = useState<GermanNounsGateView>('loading')
  const [profile, setProfileState] = useState<UserProfileResponse | null>(null)
  const [selections, setSelectionsState] = useState<GermanNounSelectionResponse[]>([])
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setError(null)
    setView('loading')
    try {
      const profileRes = await fetchWithAuth(germanNounsUrl(germanNounsEndpoints.profile.get), { method: 'GET' }, token)
      if (profileRes.status === 404) {
        setView('profile-setup')
        return
      }
      if (!profileRes.ok) {
        setError('Failed to load profile.')
        return
      }
      const profileData: UserProfileResponse = await profileRes.json()
      setProfileState(profileData)

      const selectionsRes = await fetchWithAuth(
        germanNounsUrl(germanNounsEndpoints.profile.selections),
        { method: 'GET' },
        token,
      )
      if (!selectionsRes.ok) {
        setError('Failed to load noun selections.')
        return
      }
      const selectionsData: GermanNounSelectionResponse[] = await selectionsRes.json()
      setSelectionsState(selectionsData)
      setView('selection')
    } catch {
      setError('Network error. Please try again.')
    }
  }, [token])

  useEffect(() => {
    refresh()
  }, [refresh])

  return {
    view,
    profile,
    selections,
    error,
    refresh,
    setProfile: (p: UserProfileResponse) => {
      setProfileState(p)
      setView('selection')
    },
    setSelections: setSelectionsState,
    showSelection: () => setView('selection'),
    showReady: () => setView('ready'),
  }
}
