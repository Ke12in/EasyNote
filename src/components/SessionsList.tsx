import type { SessionRow } from '../lib/sessions'

type Props = {
  sessions: SessionRow[]
  currentId: string | null
  onSelect: (id: string) => void
  onNew: () => void
  loading?: boolean
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function SessionsList({ sessions, currentId, onSelect, onNew, loading }: Props) {
  if (loading) {
    return (
      <div className="p-4 text-zinc-500 text-sm">Loading your sessions…</div>
    )
  }
  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onNew}
        className="w-full py-3 px-4 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500 text-sm"
      >
        + New session
      </button>
      {sessions.length === 0 ? (
        <p className="text-zinc-500 text-sm py-4">No sessions yet. Create one to start.</p>
      ) : (
        <ul className="space-y-1">
          {sessions.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => onSelect(s.id)}
                className={`w-full text-left py-2.5 px-4 rounded-lg border text-sm transition ${
                  currentId === s.id
                    ? 'bg-indigo-600/20 border-indigo-500 text-white'
                    : 'bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                <span className="block truncate font-medium">{s.title || 'Untitled session'}</span>
                <span className="block text-xs text-zinc-500 mt-0.5">{formatDate(s.updated_at)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
