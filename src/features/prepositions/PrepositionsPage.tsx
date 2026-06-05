import { useState } from 'react'
import { ProfileSetup } from './components/ProfileSetup'
import { PracticeTermSelector } from './components/PracticeTermSelector'
import { ExerciseView } from './components/ExerciseView'
import { MultiplePrepositionsExerciseView } from './components/MultiplePrepositionsExerciseView'
import { PrepositionChoiceExerciseView } from './components/PrepositionChoiceExerciseView'
import { usePrepositionsGate } from './hooks/usePrepositionsGate'
import type { PrepositionsExerciseMode } from './types'

export function PrepositionsPage() {
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

  const [exerciseMode, setExerciseMode] = useState<PrepositionsExerciseMode>('single')

  if (error) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-4 text-2xl font-semibold text-slate-800">Prepositions</h1>
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
        <h1 className="mb-4 text-2xl font-semibold text-slate-800">Prepositions</h1>
        <p className="text-slate-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-2xl font-semibold text-slate-800">Prepositions</h1>
      <p className="mb-6 text-sm text-slate-600">
        Practice single prepositions, choose between options in context, or pick between easily
        confused pairs such as <em>in</em> vs <em>into</em>.
      </p>

      {view === 'profile-setup' && <ProfileSetup onProfileCreated={setProfile} />}

      {view === 'selection' && (
        <PracticeTermSelector
          selections={selections}
          onSelectionsUpdated={setSelections}
          onStartSingle={() => {
            setExerciseMode('single')
            showReady()
          }}
          onStartMultiple={() => {
            setExerciseMode('multiple')
            showReady()
          }}
          onStartChoice={() => {
            setExerciseMode('choice')
            showReady()
          }}
        />
      )}

      {view === 'ready' && profile && exerciseMode === 'single' && (
        <ExerciseView profile={profile} selections={selections} onOpenSelector={showSelection} />
      )}

      {view === 'ready' && profile && exerciseMode === 'multiple' && (
        <MultiplePrepositionsExerciseView
          profile={profile}
          selections={selections}
          onOpenSelector={showSelection}
        />
      )}

      {view === 'ready' && profile && exerciseMode === 'choice' && (
        <PrepositionChoiceExerciseView
          profile={profile}
          selections={selections}
          onOpenSelector={showSelection}
        />
      )}
    </div>
  )
}
