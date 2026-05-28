import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/context/AuthContext'
import { resolveAdminPageId } from '@/shared/adminNavigation'
import { AdminSidebarNav } from '@/layout/AdminSidebarNav'
import {
  APP_LANGUAGES,
  findModuleByPath,
  getModulesForLanguage,
  parseLanguageParam,
  type LanguageId,
} from '@/shared/appNavigation'

type NavSection = 'learn' | 'admin'

function navLinkClass(isActive: boolean): string {
  return `w-full rounded-lg px-3 py-2 text-left text-sm ${
    isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'
  }`
}

export function AppShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const {
    user,
    isAdmin,
    hasEnglishAccess,
    hasPhrasalVerbsAccess,
    hasPrepositionsAccess,
    hasChatPracticeAccess,
    hasGermanNounsAccess,
    hasGermanVerbsAccess,
    logout,
  } = useAuth()

  const [nav, setNav] = useState<NavSection>(() =>
    location.pathname.startsWith('/admin') ? 'admin' : 'learn',
  )
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  useEffect(() => {
    if (location.pathname.startsWith('/admin')) {
      setNav('admin')
    }
  }, [location.pathname])

  const accessFlags = useMemo(
    () => ({
      hasEnglishAccess,
      hasPhrasalVerbsAccess,
      hasPrepositionsAccess,
      hasChatPracticeAccess,
      hasGermanNounsAccess,
      hasGermanVerbsAccess,
    }),
    [
      hasEnglishAccess,
      hasPhrasalVerbsAccess,
      hasPrepositionsAccess,
      hasChatPracticeAccess,
      hasGermanNounsAccess,
      hasGermanVerbsAccess,
    ],
  )

  const activeModule = findModuleByPath(location.pathname)
  const activeAdminPage = resolveAdminPageId(location.pathname)
  const languageFromQuery = parseLanguageParam(
    new URLSearchParams(location.search).get('lang'),
  )
  const selectedLanguage: LanguageId | null =
    activeModule?.languageId ?? languageFromQuery

  const modules = selectedLanguage
    ? getModulesForLanguage(selectedLanguage, accessFlags)
    : []

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const selectLanguage = (languageId: LanguageId) => {
    setNav('learn')
    setMobileNavOpen(false)
    navigate(`/?lang=${languageId}`)
  }

  const sidebarContent = (
    <>
      <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
        {nav === 'learn' ? 'Languages' : 'Administration'}
      </p>
      {nav === 'learn' ? (
        <ul className="space-y-1">
          {APP_LANGUAGES.map((lang) => (
            <li key={lang.id}>
              <button
                type="button"
                onClick={() => selectLanguage(lang.id)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${
                  selectedLanguage === lang.id
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
        <AdminSidebarNav
          pathname={location.pathname}
          activeAdminPage={activeAdminPage}
          onNavigate={() => setMobileNavOpen(false)}
        />
      )}
      {nav === 'learn' && selectedLanguage && (
        <>
          <p className="mb-2 mt-6 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Modules
          </p>
          {modules.length > 0 ? (
            <ul className="space-y-1">
              {modules.map((mod) => (
                <li key={mod.id}>
                  <NavLink
                    to={mod.path}
                    onClick={() => setMobileNavOpen(false)}
                    className={({ isActive }) => navLinkClass(isActive)}
                  >
                    {mod.title}
                  </NavLink>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3 text-xs text-slate-400">
              {selectedLanguage === 'de'
                ? 'Noch keine Module verfügbar.'
                : 'No modules available for your account.'}
            </p>
          )}
        </>
      )}
    </>
  )

  const sectionToggle = isAdmin ? (
    <div className="mb-4 flex gap-1 rounded-lg bg-slate-900 p-1">
      <button
        type="button"
        onClick={() => {
          setNav('learn')
          if (location.pathname.startsWith('/admin')) navigate('/')
        }}
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
          if (!location.pathname.startsWith('/admin')) navigate('/admin/sites')
        }}
        className={`flex-1 rounded-md py-1.5 text-xs font-medium ${
          nav === 'admin' ? 'bg-blue-600 text-white' : 'text-slate-400'
        }`}
      >
        Admin
      </button>
    </div>
  ) : null

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <header className="flex items-center justify-between bg-slate-800 px-4 py-3 text-white">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded p-1 hover:bg-slate-700 lg:hidden"
            onClick={() => setMobileNavOpen((open) => !open)}
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
          <Link to="/" className="font-semibold">
            LanguageApp
          </Link>
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen((open) => !open)}
            className="max-w-[12rem] truncate rounded px-2 py-1 text-sm text-slate-200 hover:bg-slate-700 sm:max-w-xs"
          >
            {user?.email ?? 'Account'}
          </button>
          {profileOpen && (
            <div
              className="absolute right-0 top-full z-50 mt-1 min-w-[180px] rounded border border-slate-600 bg-slate-800 py-1 shadow-lg"
              onMouseLeave={() => setProfileOpen(false)}
            >
              <Link
                to="/profile/update"
                className="block px-4 py-2 text-sm text-slate-200 hover:bg-slate-700"
                onClick={() => setProfileOpen(false)}
              >
                Update Profile
              </Link>
              <Link
                to="/profile/change-password"
                className="block px-4 py-2 text-sm text-slate-200 hover:bg-slate-700"
                onClick={() => setProfileOpen(false)}
              >
                Change Password
              </Link>
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false)
                  handleLogout()
                }}
                className="block w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-slate-700"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-56 shrink-0 flex-col bg-slate-800 p-3 lg:flex">
          {sectionToggle}
          {sidebarContent}
        </aside>

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
          {sectionToggle}
          {sidebarContent}
        </aside>

        <main className="min-w-0 flex-1 bg-white p-4 sm:p-6">
          <Outlet />
        </main>
      </div>

      {isAdmin && (
        <nav className="flex border-t border-slate-200 bg-white lg:hidden">
          <button
            type="button"
            onClick={() => {
              setNav('learn')
              navigate('/')
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
            onClick={() => {
              setNav('admin')
              navigate('/admin/sites')
            }}
            className={`flex flex-1 flex-col items-center py-2 text-xs ${
              nav === 'admin' ? 'text-blue-600' : 'text-slate-500'
            }`}
          >
            <span className="text-lg">⚙️</span>
            Admin
          </button>
        </nav>
      )}
    </div>
  )
}
