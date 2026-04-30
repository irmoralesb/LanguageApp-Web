import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/auth/context/AuthContext'
import { fetchWithAuth, prepositionsUrl } from '@/api/client'
import { prepEndpoints } from '@/api/endpoints'
import type {
  PracticeTermSelectionResponse,
  UserProfileResponse,
} from '../types'

export type PrepositionsGateView =
  | 'loading'
  | 'profile-setup'
  | 'selection'
  | 'ready'

export interface PrepositionsGateState {
  view: PrepositionsGateView
  profile: UserProfileResponse | null
  selections: PracticeTermSelectionResponse[]
  error: string | null
  refresh: () => Promise<void>
  setProfile: (p: UserProfileResponse) => void
  setSelections: (s: PracticeTermSelectionResponse[]) => void
  showSelection: () => void
  showReady: () => void
}

/**
 * Shared profile + practice-term selection loading flow used by every
 * Prepositions exercise page. The hook handles the common gate
 * (loading -> profile-setup -> selection -> ready) so each exercise page only
 * has to provide its own "ready" view.
 */
export function usePrepositionsGate(): PrepositionsGateState {
  const { token } = useAuth()
  const [view, setView] = useState<PrepositionsGateView>('loading')
  const [profile, setProfileState] = useState<UserProfileResponse | null>(null)
  const [selections, setSelectionsState] = useState<PracticeTermSelectionResponse[]>([])
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

      const profileData: UserProfileResponse = await profileRes.json()
      setProfileState(profileData)

      const selectionsRes = await fetchWithAuth(
        prepositionsUrl(prepEndpoints.profile.selections),
        { method: 'GET' },
        token,
      )

      if (!selectionsRes.ok) {
        setError('Failed to load practice term selections.')
        return
      }

      const selectionsData: PracticeTermSelectionResponse[] = await selectionsRes.json()
      setSelectionsState(selectionsData)
      setView(selectionsData.length > 0 ? 'ready' : 'selection')
    } catch {
      setError('Network error. Please try again.')
    }
  }, [token])

  useEffect(() => {
    refresh()
  }, [refresh])

  const setProfile = useCallback((newProfile: UserProfileResponse) => {
    setProfileState(newProfile)
    setView('selection')
  }, [])

  const setSelections = useCallback((updated: PracticeTermSelectionResponse[]) => {
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
