import { Link } from 'react-router-dom'
import { ProfileSetup } from './components/ProfileSetup'
import { VerbSelector } from './components/VerbSelector'
import { ExerciseView } from './components/ExerciseView'
import { useGermanVerbsGate } from './hooks/useGermanVerbsGate'

export function GermanVerbsPage() {
  const { view, profile, selections, error, refresh, setProfile, setSelections, showSelection, showReady } =
    useGermanVerbsGate()

  if (error) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-4 text-2xl font-semibold">German Verbs</h1>
        <p className="text-red-700">{error}</p>
        <button type="button" onClick={refresh} className="mt-4 underline">Retry</button>
      </div>
    )
  }

  if (view === 'loading') {
    return <div className="mx-auto max-w-2xl"><h1 className="text-2xl font-semibold">German Verbs</h1><p>Loading...</p></div>
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex justify-between">
        <h1 className="text-2xl font-semibold">German Verbs</h1>
        <Link to="/" className="text-sm underline">Home</Link>
      </div>
      {view === 'profile-setup' && <ProfileSetup onProfileCreated={setProfile} />}
      {view === 'selection' && <VerbSelector selections={selections} onSelectionsUpdated={setSelections} onStartPracticing={showReady} />}
      {view === 'ready' && profile && <ExerciseView selections={selections} onOpenSelector={showSelection} />}
    </div>
  )
}
