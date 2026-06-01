import { ProfileSetup } from '@/features/prepositions/components/ProfileSetup'
import { useEnglishProfileGate } from '@/features/english-shared/hooks/useEnglishProfileGate'
import { NaturalRewriteExerciseView } from './components/NaturalRewriteExerciseView'

export function NaturalRewritePage() {
  const { view, profile, error, refresh, setProfile } = useEnglishProfileGate()

  if (error) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-4 text-2xl font-semibold text-slate-800">Natural Rewrite</h1>
        <div className="rounded border border-red-300 bg-red-50 p-4 text-red-700">{error}</div>
        <button
          type="button"
          onClick={refresh}
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
        <h1 className="mb-4 text-2xl font-semibold text-slate-800">Natural Rewrite</h1>
        <p className="text-slate-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-2xl font-semibold text-slate-800">Natural Rewrite</h1>
      <p className="mb-6 text-sm text-slate-600">
        Rewrite stiff or overly formal English into a natural, conversational sentence.
      </p>

      {view === 'profile-setup' && <ProfileSetup onProfileCreated={setProfile} />}

      {view === 'ready' && profile && <NaturalRewriteExerciseView />}
    </div>
  )
}
