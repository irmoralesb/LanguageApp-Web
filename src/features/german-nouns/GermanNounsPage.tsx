import { Link } from 'react-router-dom'
import { ProfileSetup } from './components/ProfileSetup'
import { NounSelector } from './components/NounSelector'
import { GenderExerciseView } from './components/GenderExerciseView'
import { useGermanNounsGate } from './hooks/useGermanNounsGate'

export function GermanNounsPage() {
  const { view, profile, selections, error, refresh, setProfile, setSelections, showSelection, showReady } =
    useGermanNounsGate()

  if (error) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-4 text-2xl font-semibold">German Nouns</h1>
        <div className="rounded border border-red-300 bg-red-50 p-4 text-red-700">{error}</div>
        <button type="button" onClick={refresh} className="mt-4 rounded bg-slate-700 px-4 py-2 text-white">Retry</button>
      </div>
    )
  }

  if (view === 'loading') {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-4 text-2xl font-semibold">German Nouns</h1>
        <p className="text-slate-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex justify-between">
        <h1 className="text-2xl font-semibold">German Nouns</h1>
        <Link to="/" className="text-sm underline">Home</Link>
      </div>
      {view === 'profile-setup' && <ProfileSetup onProfileCreated={setProfile} />}
      {view === 'selection' && (
        <NounSelector selections={selections} onSelectionsUpdated={setSelections} onStartPracticing={showReady} />
      )}
      {view === 'ready' && profile && (
        <GenderExerciseView onOpenSelector={showSelection} />
      )}
    </div>
  )
}
