import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/auth/context/AuthContext'
import { englishUrl, fetchWithAuth, prepositionsUrl } from '@/api/client'
import { expressionsEndpoints, prepEndpoints } from '@/api/endpoints'
import type { UserProfileResponse } from '@/features/prepositions/types'
import type { EnglishExpressionSelectionResponse } from '../types'

export type ExpressionsGateView = 'loading' | 'profile-setup' | 'selection' | 'ready'

export function useExpressionsGate() {
  const { token } = useAuth()
  const [view, setView] = useState<ExpressionsGateView>('loading')
  const [profile, setProfileState] = useState<UserProfileResponse | null>(null)
  const [selections, setSelectionsState] = useState<EnglishExpressionSelectionResponse[]>([])
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

      const selectionsRes = await fetchWithAuth(
        englishUrl(expressionsEndpoints.profile.selections),
        { method: 'GET' },
        token,
      )

      if (!selectionsRes.ok) {
        setError('Failed to load expression selections.')
        return
      }

      const selectionsData: EnglishExpressionSelectionResponse[] = await selectionsRes.json()
      setSelectionsState(selectionsData)
      setView('selection')
    } catch {
      setError('Network error. Please try again.')
    }
  }, [token])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const setProfile = useCallback((newProfile: UserProfileResponse) => {
    setProfileState(newProfile)
    setView('selection')
  }, [])

  const setSelections = useCallback((updated: EnglishExpressionSelectionResponse[]) => {
    setSelectionsState(updated)
  }, [])

  const showSelection = useCallback(() => setView('selection'), [])
  const showReady = useCallback(() => setView('ready'), [])

  return {
    view,
    profile,
    selections,
    error,
    refresh,
    setProfile,
    setSelections,
    showSelection,
    showReady,
  }
}
