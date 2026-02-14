import { useState } from 'react'
import type { NoteItem } from '../types'

interface NotesPanelProps {
  notes: NoteItem[]
  onAddNote: (content: string) => void
}

function formatTime(ms: number) {
  const d = new Date(ms)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function NotesPanel({ notes, onAddNote }: NotesPanelProps) {
  const [input, setInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const text = input.trim()
    if (text) {
      onAddNote(text)
      setInput('')
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row sm:gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Quick note so you don’t miss it..."
          className="flex-1 min-w-0 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 min-h-[44px] sm:min-h-0 text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="w-full sm:w-auto px-4 py-3 min-h-[44px] sm:min-h-0 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-500 active:bg-indigo-500 shrink-0"
        >
          Add note
        </button>
      </form>
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-zinc-400">Your notes</h3>
        {notes.length === 0 ? (
          <p className="text-zinc-500 text-sm">Add notes as you go so you don’t miss anything — they’re timestamped.</p>
        ) : (
          <ul className="space-y-2">
            {notes.map((note) => (
              <li
                key={note.id}
                className="bg-zinc-800/80 border border-zinc-700 rounded-lg px-3 py-3 sm:px-4 flex flex-col gap-1 sm:flex-row sm:gap-3 sm:items-start"
              >
                <span className="text-zinc-500 text-xs shrink-0">
                  {formatTime(note.timestamp)}
                </span>
                <span className="text-sm text-zinc-200 break-words min-w-0">{note.content}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
