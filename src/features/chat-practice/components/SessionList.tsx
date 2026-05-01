import type { ChatSession } from '../types'

interface Props {
  sessions: ChatSession[]
  activeSessionId: string | null
  onSelect: (session: ChatSession) => void
  onNew: () => void
  loading: boolean
}

export function SessionList({ sessions, activeSessionId, onSelect, onNew, loading }: Props) {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-700">Sessions</h2>
        <button
          type="button"
          onClick={onNew}
          disabled={loading}
          className="rounded bg-indigo-600 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          + New
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {sessions.length === 0 && (
          <p className="px-4 py-6 text-center text-xs text-slate-400">
            No sessions yet. Start a new one!
          </p>
        )}
        {sessions.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelect(s)}
            className={`w-full px-4 py-3 text-left transition-colors ${
              s.id === activeSessionId
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <p className="truncate text-sm font-medium">
              {s.topic ?? 'General conversation'}
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              {new Date(s.updated_at).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </button>
        ))}
      </div>
    </aside>
  )
}
