import { useState } from 'react'

interface SummaryPanelProps {
  transcript: string
  summary: string
  onGenerateSummary: () => void
  setSummary: (s: string) => void
}

export function SummaryPanel({
  transcript,
  summary,
  onGenerateSummary,
  setSummary,
}: SummaryPanelProps) {
  const [editing, setEditing] = useState(false)

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-zinc-900/80 border border-zinc-800 p-3 sm:p-4">
        <h3 className="text-sm font-medium text-zinc-400 mb-2">Transcript (from recording)</h3>
        <div className="min-h-[80px] max-h-[25vh] sm:max-h-[220px] overflow-y-auto text-sm text-zinc-300 whitespace-pre-wrap">
          {transcript || '(Start a recording to capture what’s said — then summarize so nothing gets lost.)'}
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={onGenerateSummary}
          className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] sm:min-h-0 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-500 active:bg-indigo-500"
        >
          Generate summary from transcript
        </button>
      </div>
      <div className="rounded-xl bg-zinc-900/80 border border-zinc-800 p-3 sm:p-4">
        <h3 className="text-sm font-medium text-zinc-400 mb-2">Summary</h3>
        {editing ? (
          <>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              onBlur={() => setEditing(false)}
              className="w-full min-h-[140px] sm:min-h-[160px] bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-0"
              placeholder="Key points so you don’t miss anything — or paste from elsewhere."
              autoFocus
            />
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="mt-2 min-h-[44px] sm:min-h-0 py-2 text-sm text-zinc-500 hover:text-zinc-400 active:text-zinc-400"
            >
              Done editing
            </button>
          </>
        ) : (
          <div className="min-h-[140px] sm:min-h-[160px]">
            <div className="text-sm text-zinc-300 whitespace-pre-wrap break-words">
              {summary || '(No summary yet. Generate from the transcript or write key points so you don’t miss anything.)'}
            </div>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="mt-2 min-h-[44px] sm:min-h-0 py-2 text-sm text-indigo-400 hover:text-indigo-300 active:text-indigo-300"
            >
              Edit summary
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
