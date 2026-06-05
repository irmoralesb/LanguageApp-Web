import { useState } from 'react'
import { ProfileSetup } from '@/features/prepositions/components/ProfileSetup'
import { useEnglishProfileGate } from '@/features/english-shared/hooks/useEnglishProfileGate'
import { ConfusableWordsExerciseView } from '@/features/confusable-words/components/ConfusableWordsExerciseView'
import { NaturalRewriteExerciseView } from '@/features/natural-rewrite/components/NaturalRewriteExerciseView'
import { RegisterSwitchExerciseView } from '@/features/register-practice/components/RegisterSwitchExerciseView'
import { SentenceSkillsHub } from './components/SentenceSkillsHub'
import type { SentenceSkillsExerciseMode } from './types'

export function SentenceSkillsPage() {
  const { view, profile, error, refresh, setProfile, showSelection, showReady } =
    useEnglishProfileGate()

  const [exerciseMode, setExerciseMode] = useState<SentenceSkillsExerciseMode>('confusable-words')

  if (error) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-4 text-2xl font-semibold text-slate-800">Sentence Skills</h1>
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
        <h1 className="mb-4 text-2xl font-semibold text-slate-800">Sentence Skills</h1>
        <p className="text-slate-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-2xl font-semibold text-slate-800">Sentence Skills</h1>
      <p className="mb-6 text-sm text-slate-600">
        Practice word choice, natural phrasing, and register switching in English sentences.
      </p>

      {view === 'profile-setup' && <ProfileSetup onProfileCreated={setProfile} />}

      {view === 'selection' && (
        <SentenceSkillsHub
          onStartConfusableWords={() => {
            setExerciseMode('confusable-words')
            showReady()
          }}
          onStartNaturalRewrite={() => {
            setExerciseMode('natural-rewrite')
            showReady()
          }}
          onStartRegisterPractice={() => {
            setExerciseMode('register-practice')
            showReady()
          }}
        />
      )}

      {view === 'ready' && profile && exerciseMode === 'confusable-words' && (
        <ConfusableWordsExerciseView onOpenHub={showSelection} />
      )}

      {view === 'ready' && profile && exerciseMode === 'natural-rewrite' && (
        <NaturalRewriteExerciseView onOpenHub={showSelection} />
      )}

      {view === 'ready' && profile && exerciseMode === 'register-practice' && (
        <RegisterSwitchExerciseView onOpenHub={showSelection} />
      )}
    </div>
  )
}
