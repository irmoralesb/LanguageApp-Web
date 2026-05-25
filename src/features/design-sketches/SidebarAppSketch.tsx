import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SketchShell } from './components/SketchShell'
import { PhrasalVerbPracticeProposal } from './components/PhrasalVerbPracticeProposal'
import {
  ChatPracticeProposal,
  PrepositionsPracticeProposal,
} from './components/ExerciseProposals'
import {
  AdminSectionProposal,
} from './components/AdminSectionProposal'
import { ADMIN_PAGES, type AdminPageId } from './adminSketchData'
import {
  MOCK_EXERCISE,
  MOCK_LANGUAGES,
  MOCK_MODULES,
  type SketchLanguage,
  type SketchModule,
} from './mockData'

type UserView = 'languages' | 'modules' | 'practice'
type NavSection = 'learn' | 'admin'

export function SidebarAppSketch() {
  const [nav, setNav] = useState<NavSection>('learn')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [userView, setUserView] = useState<UserView>('languages')
  const [language, setLanguage] = useState<SketchLanguage | null>(null)
  const [module, setModule] = useState<SketchModule | null>(null)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [activeAdminPage, setActiveAdminPage] = useState<AdminPageId>('sites')

  const modules = language ? MOCK_MODULES[language.id] ?? [] : []

  const selectLanguage = (lang: SketchLanguage) => {
    setLanguage(lang)
    setModule(null)
    setUserView('modules')
    setMobileNavOpen(false)
  }

  const selectModule = (mod: SketchModule) => {
    setModule(mod)
    setUserView('practice')
    setMobileNavOpen(false)
  }

  const sidebarContent = (
    <>
      <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
        {nav === 'learn' ? 'Languages' : 'Administration'}
      </p>
      {nav === 'learn' ? (
        <ul className="space-y-1">
          {MOCK_LANGUAGES.map((lang) => (
            <li key={lang.id}>
              <button
                type="button"
                onClick={() => selectLanguage(lang)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${
                  language?.id === lang.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="space-y-1">
          {ADMIN_PAGES.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => {
                  setActiveAdminPage(item.id)
                  setMobileNavOpen(false)
                }}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                  activeAdminPage === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span className="block">{item.label}</span>
                <span className="block text-xs opacity-70">{item.group}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {nav === 'learn' && language && (
        <>
          <p className="mb-2 mt-6 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Modules
          </p>
          <ul className="space-y-1">
            {modules.map((mod) => (
              <li key={mod.id}>
                <button
                  type="button"
                  onClick={() => selectModule(mod)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                    module?.id === mod.id
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {mod.title}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  )

  return (
    <SketchShell
      designId="C"
      designName="App Sidebar"
      tagline="Persistent sidebar on desktop; bottom nav on mobile — admin & learn in one shell"
      accentClass="border-slate-600 bg-gradient-to-r from-slate-700 to-blue-800 text-white"
    >
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-lg">
        {/* App chrome */}
        <header className="flex items-center justify-between bg-slate-800 px-4 py-3 text-white">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded p-1 hover:bg-slate-700 lg:hidden"
              onClick={() => setMobileNavOpen((o) => !o)}
              aria-label="Toggle navigation"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <span className="font-semibold">LanguageApp</span>
          </div>
          <span className="hidden text-sm text-slate-400 sm:inline">learner@example.com</span>
        </header>

        <div className="flex min-h-[480px]">
          {/* Desktop sidebar */}
          <aside className="hidden w-56 shrink-0 flex-col bg-slate-800 p-3 lg:flex">
            <div className="mb-4 flex gap-1 rounded-lg bg-slate-900 p-1">
              <button
                type="button"
                onClick={() => setNav('learn')}
                className={`flex-1 rounded-md py-1.5 text-xs font-medium ${
                  nav === 'learn' ? 'bg-blue-600 text-white' : 'text-slate-400'
                }`}
              >
                Learn
              </button>
              <button
                type="button"
                onClick={() => {
                  setNav('admin')
                  setMobileNavOpen(false)
                }}
                className={`flex-1 rounded-md py-1.5 text-xs font-medium ${
                  nav === 'admin' ? 'bg-blue-600 text-white' : 'text-slate-400'
                }`}
              >
                Admin
              </button>
            </div>
            {sidebarContent}
          </aside>

          {/* Mobile drawer */}
          {mobileNavOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
              onClick={() => setMobileNavOpen(false)}
              aria-hidden
            />
          )}
          <aside
            className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-800 p-3 pt-16 transition-transform lg:hidden ${
              mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="mb-4 flex gap-1 rounded-lg bg-slate-900 p-1">
              <button
                type="button"
                onClick={() => setNav('learn')}
                className={`flex-1 rounded-md py-1.5 text-xs font-medium ${
                  nav === 'learn' ? 'bg-blue-600 text-white' : 'text-slate-400'
                }`}
              >
                Learn
              </button>
              <button
                type="button"
                onClick={() => setNav('admin')}
                className={`flex-1 rounded-md py-1.5 text-xs font-medium ${
                  nav === 'admin' ? 'bg-blue-600 text-white' : 'text-slate-400'
                }`}
              >
                Admin
              </button>
            </div>
            {sidebarContent}
          </aside>

          {/* Main content */}
          <main className="min-w-0 flex-1 bg-white p-4 sm:p-6">
            {nav === 'admin' ? (
              <AdminSectionProposal accent="blue" activePage={activeAdminPage} />
            ) : userView === 'languages' ? (
              <LanguagesMain onSelect={selectLanguage} />
            ) : userView === 'modules' && language ? (
              <ModulesMain language={language} modules={modules} onSelect={selectModule} />
            ) : userView === 'practice' && language && module ? (
              module.id === 'pv' ? (
                <PhrasalVerbPracticeProposal
                  accent="blue"
                  compact
                  onBack={() => setUserView('modules')}
                />
              ) : module.id === 'prep' ? (
                <PrepositionsPracticeProposal
                  accent="blue"
                  compact
                  onBack={() => setUserView('modules')}
                />
              ) : module.id === 'chat' ? (
                <ChatPracticeProposal
                  accent="blue"
                  compact
                  onBack={() => setUserView('modules')}
                />
              ) : (
                <PracticeMain
                  language={language}
                  module={module}
                  selectedOption={selectedOption}
                  onSelectOption={setSelectedOption}
                  onBack={() => setUserView('modules')}
                />
              )
            ) : null}
          </main>
        </div>

        {/* Mobile bottom nav */}
        <nav className="flex border-t border-slate-200 bg-white lg:hidden">
          <button
            type="button"
            onClick={() => {
              setNav('learn')
              setUserView('languages')
              setLanguage(null)
              setModule(null)
            }}
            className={`flex flex-1 flex-col items-center py-2 text-xs ${
              nav === 'learn' ? 'text-blue-600' : 'text-slate-500'
            }`}
          >
            <span className="text-lg">📚</span>
            Learn
          </button>
          <button
            type="button"
            onClick={() => setNav('admin')}
            className={`flex flex-1 flex-col items-center py-2 text-xs ${
              nav === 'admin' ? 'text-blue-600' : 'text-slate-500'
            }`}
          >
            <span className="text-lg">⚙️</span>
            Admin
          </button>
        </nav>
      </div>

      <p className="mt-4 text-center text-xs text-slate-500">
        <Link to="/design-sketches" className="text-blue-600 hover:underline">
          Compare with other sketches
        </Link>
      </p>
    </SketchShell>
  )
}

function LanguagesMain({ onSelect }: { onSelect: (lang: SketchLanguage) => void }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Welcome back</h2>
      <p className="mt-1 text-slate-600">Select a language from the sidebar, or tap a card below.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {MOCK_LANGUAGES.map((lang) => (
          <button
            key={lang.id}
            type="button"
            onClick={() => onSelect(lang)}
            className="rounded-xl border border-slate-200 p-4 text-left hover:border-blue-300 hover:shadow-sm"
          >
            <span className="text-2xl">{lang.flag}</span>
            <p className="mt-2 font-semibold">{lang.name}</p>
            <p className="text-sm text-slate-500">{lang.progress}% progress</p>
          </button>
        ))}
      </div>
    </div>
  )
}

function ModulesMain({
  language,
  modules,
  onSelect,
}: {
  language: SketchLanguage
  modules: SketchModule[]
  onSelect: (mod: SketchModule) => void
}) {
  const isGermanSection = language.id === 'de'

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900">
        {language.flag} {language.name}
      </h2>
      <p className="mt-1 text-slate-600">
        {isGermanSection ? 'Verfügbare Module für diese Sprache.' : 'Modules available for this language.'}
      </p>
      {modules.length > 0 ? (
        <div className="mt-6 space-y-2">
          {modules.map((mod) => (
            <button
              key={mod.id}
              type="button"
              onClick={() => onSelect(mod)}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left hover:bg-slate-50"
            >
              <div>
                <p className="font-medium text-slate-900">{mod.title}</p>
                <p className="text-sm text-slate-500">{mod.description}</p>
              </div>
              <span className="text-blue-600">{isGermanSection ? 'Starten' : 'Start'} →</span>
            </button>
          ))}
        </div>
      ) : (
        <p className="mt-6 rounded-xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
          {isGermanSection
            ? 'Für Deutsch sind noch keine Module verfügbar.'
            : 'No modules available for this language.'}
        </p>
      )}
    </div>
  )
}

function PracticeMain({
  language,
  module,
  selectedOption,
  onSelectOption,
  onBack,
}: {
  language: SketchLanguage
  module: SketchModule
  selectedOption: number | null
  onSelectOption: (i: number) => void
  onBack: () => void
}) {
  return (
    <div className="mx-auto max-w-lg">
      <button type="button" onClick={onBack} className="mb-4 text-sm text-blue-600 hover:underline">
        ← {module.title}
      </button>
      <div className="rounded-xl border border-slate-200 p-5 sm:p-6">
        <p className="text-sm text-slate-500">
          {language.name} · {module.title}
        </p>
        <p className="mt-4 text-slate-600">{MOCK_EXERCISE.prompt}</p>
        <p className="my-3 text-lg font-medium">{MOCK_EXERCISE.sentence}</p>
        <div className="space-y-2">
          {MOCK_EXERCISE.options.map((opt, i) => (
            <button
              key={opt}
              type="button"
              onClick={() => onSelectOption(i)}
              className={`w-full rounded-lg border px-4 py-2.5 text-left text-sm ${
                selectedOption === i ? 'border-blue-500 bg-blue-50' : 'border-slate-200'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
