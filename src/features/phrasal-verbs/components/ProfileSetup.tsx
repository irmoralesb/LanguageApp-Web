import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/auth/context/AuthContext'
import { fetchWithAuth, phrasalVerbsUrl } from '@/api/client'
import { pvEndpoints } from '@/api/endpoints'
import type { LanguageResponse, UserProfileResponse } from '../types'

interface ProfileSetupProps {
  onProfileCreated: (profile: UserProfileResponse) => void
}

export function ProfileSetup({ onProfileCreated }: ProfileSetupProps) {
  const { token } = useAuth()
  const [languages, setLanguages] = useState<LanguageResponse[]>([])
  const [selectedLanguageId, setSelectedLanguageId] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadLanguages() {
      try {
        const res = await fetchWithAuth(
          phrasalVerbsUrl(pvEndpoints.languages.native),
          { method: 'GET' },
          token,
        )
        if (!res.ok) {
          setError('Failed to load languages.')
          return
        }
        const data: LanguageResponse[] = await res.json()
        setLanguages(data)
      } catch {
        setError('Network error loading languages.')
      } finally {
        setLoading(false)
      }
    }
    loadLanguages()
  }, [token])

  const handleSubmit = useCallback(async () => {
    if (!selectedLanguageId) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetchWithAuth(
        phrasalVerbsUrl(pvEndpoints.profile.create),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ native_language_id: selectedLanguageId }),
        },
        token,
      )
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        setError(body?.detail ?? 'Failed to create profile.')
        return
      }
      const profile: UserProfileResponse = await res.json()
      onProfileCreated(profile)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }, [selectedLanguageId, token, onProfileCreated])

  if (loading) {
    return <p className="text-slate-500">Loading languages...</p>
  }

  return (
    <div className="rounded border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-2 text-lg font-semibold text-slate-800">Welcome to Phrasal Verbs!</h2>
      <p className="mb-6 text-slate-600">
        Before you start, please select your native language so we can show exercises in your language.
      </p>

      {error && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <label htmlFor="native-language" className="mb-1 block text-sm font-medium text-slate-700">
        Native Language
      </label>
      <select
        id="native-language"
        value={selectedLanguageId}
        onChange={(e) => setSelectedLanguageId(e.target.value)}
        className="mb-6 block w-full rounded border border-slate-300 px-3 py-2 text-slate-800 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
      >
        <option value="">Select a language...</option>
        {languages.map((lang) => (
          <option key={lang.id} value={lang.id}>
            {lang.name}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!selectedLanguageId || submitting}
        className="rounded bg-slate-700 px-5 py-2 text-white hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? 'Creating...' : 'Continue'}
      </button>
    </div>
  )
}
