import { useState } from 'react'
import { ProfileSetup } from '@/features/prepositions/components/ProfileSetup'
import { ExpressionSelector } from './components/ExpressionSelector'
import { IdiomCompleteExerciseView } from './components/IdiomCompleteExerciseView'
import { CollocationChoiceExerciseView } from './components/CollocationChoiceExerciseView'
import { UseInContextExerciseView } from './components/UseInContextExerciseView'
import { useExpressionsGate } from './hooks/useExpressionsGate'
import type { ExpressionsExerciseMode } from './types'

export function ExpressionsPage() {
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
  } = useExpressionsGate()

  const [exerciseMode, setExerciseMode] = useState<ExpressionsExerciseMode>('idiom-complete')

  if (error) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-4 text-2xl font-semibold text-slate-800">Expressions</h1>
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
        <h1 className="mb-4 text-2xl font-semibold text-slate-800">Expressions</h1>
        <p className="text-slate-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-2xl font-semibold text-slate-800">Expressions</h1>
      <p className="mb-6 text-sm text-slate-600">
        Practice idioms, collocations, and natural usage with expressions from the catalog.
      </p>

      {view === 'profile-setup' && <ProfileSetup onProfileCreated={setProfile} />}

      {view === 'selection' && (
        <ExpressionSelector
          selections={selections}
          onSelectionsUpdated={setSelections}
          onStartIdiomComplete={() => {
            setExerciseMode('idiom-complete')
            showReady()
          }}
          onStartCollocationChoice={() => {
            setExerciseMode('collocation-choice')
            showReady()
          }}
          onStartUseInContext={() => {
            setExerciseMode('use-in-context')
            showReady()
          }}
        />
      )}

      {view === 'ready' && profile && exerciseMode === 'idiom-complete' && (
        <IdiomCompleteExerciseView selections={selections} onOpenSelector={showSelection} />
      )}

      {view === 'ready' && profile && exerciseMode === 'collocation-choice' && (
        <CollocationChoiceExerciseView selections={selections} onOpenSelector={showSelection} />
      )}

      {view === 'ready' && profile && exerciseMode === 'use-in-context' && (
        <UseInContextExerciseView selections={selections} onOpenSelector={showSelection} />
      )}
    </div>
  )
}
