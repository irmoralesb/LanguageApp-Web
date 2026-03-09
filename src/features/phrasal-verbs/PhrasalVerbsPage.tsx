import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/auth/context/AuthContext'
import { fetchWithAuth, phrasalVerbsUrl } from '@/api/client'
import { pvEndpoints } from '@/api/endpoints'
import type { UserProfileResponse, PhrasalVerbSelectionResponse } from './types'
import { ProfileSetup } from './components/ProfileSetup'
import { PhrasalVerbSelector } from './components/PhrasalVerbSelector'
import { ExerciseView } from './components/ExerciseView'

type View = 'loading' | 'profile-setup' | 'selection' | 'exercise'

export function PhrasalVerbsPage() {
  const { token } = useAuth()
  const [view, setView] = useState<View>('loading')
  const [profile, setProfile] = useState<UserProfileResponse | null>(null)
  const [selections, setSelections] = useState<PhrasalVerbSelectionResponse[]>([])
  const [error, setError] = useState<string | null>(null)

  const loadProfileAndSelections = useCallback(async () => {
    setError(null)
    setView('loading')
    try {
      const profileRes = await fetchWithAuth(
        phrasalVerbsUrl(pvEndpoints.profile.get),
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
      setProfile(profileData)

      const selectionsRes = await fetchWithAuth(
        phrasalVerbsUrl(pvEndpoints.profile.selections),
        { method: 'GET' },
        token,
      )

      if (!selectionsRes.ok) {
        setError('Failed to load phrasal verb selections.')
        return
      }

      const selectionsData: PhrasalVerbSelectionResponse[] = await selectionsRes.json()
      setSelections(selectionsData)
      setView(selectionsData.length > 0 ? 'exercise' : 'selection')
    } catch {
      setError('Network error. Please try again.')
    }
  }, [token])

  useEffect(() => {
    loadProfileAndSelections()
  }, [loadProfileAndSelections])

  const handleProfileCreated = useCallback((newProfile: UserProfileResponse) => {
    setProfile(newProfile)
    setView('selection')
  }, [])

  const handleSelectionsUpdated = useCallback((updated: PhrasalVerbSelectionResponse[]) => {
    setSelections(updated)
  }, [])

  const handleStartPracticing = useCallback(() => {
    setView('exercise')
  }, [])

  const handleOpenSelector = useCallback(() => {
    setView('selection')
  }, [])

  if (error) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-4 text-2xl font-semibold text-slate-800">Phrasal Verbs</h1>
        <div className="rounded border border-red-300 bg-red-50 p-4 text-red-700">{error}</div>
        <button
          type="button"
          onClick={loadProfileAndSelections}
          className="mt-4 rounded bg-slate-700 px-4 py-2 text-white hover:bg-slate-600"
        >
          Retry
        </button>
      </div>
    )
  }

  if (view === 'loading') {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-4 text-2xl font-semibold text-slate-800">Phrasal Verbs</h1>
        <p className="text-slate-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">Phrasal Verbs</h1>
        <Link
          to="/"
          className="text-sm text-slate-600 underline hover:text-slate-800"
        >
          Back to Home
        </Link>
      </div>

      {view === 'profile-setup' && (
        <ProfileSetup onProfileCreated={handleProfileCreated} />
      )}

      {view === 'selection' && (
        <PhrasalVerbSelector
          selections={selections}
          onSelectionsUpdated={handleSelectionsUpdated}
          onStartPracticing={handleStartPracticing}
        />
      )}

      {view === 'exercise' && profile && (
        <ExerciseView
          profile={profile}
          selections={selections}
          onOpenSelector={handleOpenSelector}
        />
      )}
    </div>
  )
}
