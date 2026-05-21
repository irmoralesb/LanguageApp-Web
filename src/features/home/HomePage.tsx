import { Link } from 'react-router-dom'
import { useAuth } from '@/auth/context/AuthContext'
import { LANGUAGE_LABELS, PRACTICE_MODULES, type ModuleLanguage } from '@/config/modules'

export function HomePage() {
  const { user, hasServiceAccess } = useAuth()

  const modulesByLanguage = (PRACTICE_MODULES as typeof PRACTICE_MODULES).reduce(
    (acc, mod) => {
      if (!hasServiceAccess(mod.serviceName)) return acc
      if (!acc[mod.language]) acc[mod.language] = []
      acc[mod.language].push(mod)
      return acc
    },
    {} as Partial<Record<ModuleLanguage, typeof PRACTICE_MODULES>>,
  )

  const languages = (['en', 'de'] as ModuleLanguage[]).filter((l) => modulesByLanguage[l]?.length)

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-2 text-2xl font-semibold text-slate-800">Home</h1>
      <p className="mb-8 text-slate-600">
        Welcome{user?.email ? `, ${user.email}` : ''}. Choose a practice module below.
      </p>

      {languages.length === 0 ? (
        <p className="text-slate-500">No practice modules are assigned to your account yet.</p>
      ) : (
        languages.map((lang) => (
          <section key={lang} className="mb-8">
            <h2 className="mb-3 text-lg font-medium text-slate-700">{LANGUAGE_LABELS[lang]} modules</h2>
            <ul className="space-y-2">
              {modulesByLanguage[lang]!.map((mod) => (
                <li key={mod.key}>
                  <Link
                    to={mod.path}
                    className="block rounded border border-slate-200 bg-white px-4 py-3 shadow-sm hover:border-slate-400"
                  >
                    {mod.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  )
}
