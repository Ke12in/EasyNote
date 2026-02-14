import { useState, useCallback, useRef } from 'react'
import type { SnapshotItem, NoteItem } from './types'
import { SplashScreen } from './components/SplashScreen'
import { RecorderPanel } from './components/RecorderPanel'
import { NotesPanel } from './components/NotesPanel'
import { SnapshotsPanel } from './components/SnapshotsPanel'
import { SummaryPanel } from './components/SummaryPanel'
import { ExportPanel } from './components/ExportPanel'

type TabId = 'record' | 'notes' | 'snapshots' | 'summary' | 'export'

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'record', label: 'Record', icon: '⏺' },
  { id: 'notes', label: 'Notes', icon: '📝' },
  { id: 'snapshots', label: 'Snapshots', icon: '📷' },
  { id: 'summary', label: 'Summary', icon: '📋' },
  { id: 'export', label: 'Export PDF', icon: '📄' },
]

function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [activeTab, setActiveTab] = useState<TabId>('record')
  const [sessionTitle, setSessionTitle] = useState('')
  const [notes, setNotes] = useState<NoteItem[]>([])
  const [snapshots, setSnapshots] = useState<SnapshotItem[]>([])
  const [transcript, setTranscript] = useState('')
  const [summary, setSummary] = useState('')
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const recorderRef = useRef<{
    addSnapshot: (dataUrl: string, label: string) => void
    getTranscript: () => string
    stop: () => void
  } | null>(null)

  const addNote = useCallback((content: string) => {
    setNotes((prev) => [
      ...prev,
      { id: crypto.randomUUID(), timestamp: Date.now(), content },
    ])
  }, [])

  const addSnapshot = useCallback((dataUrl: string, label: string) => {
    setSnapshots((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        label: label || `Snapshot ${prev.length + 1}`,
        dataUrl,
      },
    ])
  }, [])

  const captureFromRecorder = useCallback(() => {
    recorderRef.current?.addSnapshot('', '')
  }, [])

  const generateSummary = useCallback(() => {
    const text = transcript.trim()
    if (!text) {
      setSummary('(No transcript yet. Start recording and speak — then generate a summary so you don’t miss the key points.)')
      return
    }
    const sentences = text.split(/\.[\s\n]+|\n+/).filter(Boolean)
    const key = sentences.slice(0, Math.min(8, Math.ceil(sentences.length / 2)))
    setSummary(key.join('. ') + (key.length ? '.' : ''))
  }, [transcript])

  return (
    <>
      {showSplash && (
        <SplashScreen onEnter={() => setShowSplash(false)} />
      )}
      <div className="min-h-screen bg-[#0f0f12] text-zinc-200 font-sans">
        <header className="border-b border-zinc-800 bg-[#18181c] px-3 py-3 sm:px-4 sticky top-0 z-10 pt-[env(safe-area-inset-top)]">
        <div className="max-w-6xl mx-auto flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex items-center justify-between gap-2 min-w-0">
            <h1 className="font-display font-semibold text-base sm:text-lg text-white truncate">
              EasyNote
            </h1>
          </div>
          <input
            type="text"
            placeholder="What’s this? (e.g. Meeting, call, workshop)"
            value={sessionTitle}
            onChange={(e) => setSessionTitle(e.target.value)}
            className="w-full sm:flex-1 sm:min-w-[180px] bg-zinc-800/80 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px] sm:min-h-0"
          />
          <nav className="flex gap-1 overflow-x-auto overflow-y-hidden pb-1 -mx-1 nav-tabs-scroll sm:flex-wrap sm:overflow-visible sm:pb-0 sm:mx-0">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 px-3 py-2.5 rounded-lg text-sm font-medium transition min-h-[44px] sm:min-h-0 flex items-center justify-center ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-zinc-800/60 text-zinc-400 hover:bg-zinc-700 hover:text-white active:bg-zinc-700'
                }`}
              >
                {tab.icon} <span className="ml-1">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-3 sm:p-4 pb-8">
        {activeTab === 'record' && (
          <RecorderPanel
            ref={recorderRef}
            isRecording={isRecording}
            setIsRecording={setIsRecording}
            recordingSeconds={recordingSeconds}
            setRecordingSeconds={setRecordingSeconds}
            transcript={transcript}
            setTranscript={setTranscript}
            onSnapshot={addSnapshot}
          />
        )}
        {activeTab === 'notes' && (
          <NotesPanel notes={notes} onAddNote={addNote} />
        )}
        {activeTab === 'snapshots' && (
          <SnapshotsPanel
            snapshots={snapshots}
            onCapture={captureFromRecorder}
            onAddSnapshot={addSnapshot}
            isRecording={isRecording}
          />
        )}
        {activeTab === 'summary' && (
          <SummaryPanel
            transcript={transcript}
            summary={summary}
            onGenerateSummary={generateSummary}
            setSummary={setSummary}
          />
        )}
        {activeTab === 'export' && (
          <ExportPanel
            sessionTitle={sessionTitle}
            notes={notes}
            snapshots={snapshots}
            summary={summary}
            transcript={transcript}
          />
        )}
      </main>
      </div>
    </>
  )
}

export default App
