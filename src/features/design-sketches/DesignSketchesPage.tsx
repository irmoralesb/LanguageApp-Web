import { Link } from 'react-router-dom'

const SKETCHES = [
  {
    id: 'Selected',
    path: '/design-sketches/sidebar',
    name: 'App Sidebar',
    description:
      'Desktop sidebar + compact mobile nav. Admin and User areas stay visible in the shell.',
    palette: 'from-slate-700 to-blue-800',
    bestFor: 'Power users, admins, tablet + desktop heavy use',
  },
] as const

export function DesignSketchesPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <p className="mb-1 text-sm font-medium uppercase tracking-wide text-teal-700">
          UI exploration
        </p>
        <h1 className="mb-2 text-3xl font-bold text-slate-900">Design sketches</h1>
        <p className="max-w-2xl text-slate-600">
          The selected sidebar concept for the user learning flow: choose a language, pick a
          module, then practice. It includes the Admin structure and responsive layouts for mobile,
          tablet, and desktop.
        </p>
        <p className="mt-3 max-w-2xl rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Open English modules to review exercise proposals for Phrasal Verbs, Prepositions, and
          Chat Practice. German is listed for navigation only (no modules in the live app yet).
        </p>
      </div>

      <div className="space-y-4">
        {SKETCHES.map((sketch) => (
          <Link
            key={sketch.path}
            to={sketch.path}
            className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md"
          >
            <div className={`h-2 bg-gradient-to-r ${sketch.palette}`} />
            <div className="p-5 sm:p-6">
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                  {sketch.id}
                </span>
                <h2 className="text-xl font-semibold text-slate-900 group-hover:text-teal-800">
                  {sketch.name}
                </h2>
              </div>
              <p className="mb-3 text-slate-600">{sketch.description}</p>
              <p className="text-sm text-slate-500">
                <span className="font-medium text-slate-700">Best for:</span> {sketch.bestFor}
              </p>
              <p className="mt-4 text-sm font-medium text-teal-700 group-hover:underline">
                Open interactive sketch →
              </p>
            </div>
          </Link>
        ))}
      </div>

      <p className="mt-8 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        The sidebar shell is also applied to the signed-in app. Use this page to compare or refine
        the sketch before changing production navigation.
      </p>
    </div>
  )
}
