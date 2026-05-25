import { ProfileSetup } from './components/ProfileSetup'
import { PracticeTermSelector } from './components/PracticeTermSelector'
import { MultiplePrepositionsExerciseView } from './components/MultiplePrepositionsExerciseView'
import { usePrepositionsGate } from './hooks/usePrepositionsGate'

export function MultiplePrepositionsPage() {
  const {
    view,
    profile,
    selections,
    error,
    refresh,
    setProfile,
    setSelections,
    showSelection,
    showReady,
  } = usePrepositionsGate()

  if (error) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-4 text-2xl font-semibold text-slate-800">Multiple Prepositions</h1>
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
        <h1 className="mb-4 text-2xl font-semibold text-slate-800">Multiple Prepositions</h1>
        <p className="text-slate-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-semibold text-slate-800">Multiple Prepositions</h1>

      {view === 'profile-setup' && (
        <ProfileSetup onProfileCreated={setProfile} />
      )}

      {view === 'selection' && (
        <PracticeTermSelector
          selections={selections}
          onSelectionsUpdated={setSelections}
          onStartPracticing={showReady}
        />
      )}

      {view === 'ready' && profile && (
        <MultiplePrepositionsExerciseView
          profile={profile}
          selections={selections}
          onOpenSelector={showSelection}
        />
      )}
    </div>
  )
}
