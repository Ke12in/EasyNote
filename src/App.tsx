import { useState, useCallback, useRef, useEffect } from 'react'
import { Analytics } from '@vercel/analytics/next'
import { useAuth } from './context/AuthContext'
import type { SnapshotItem, NoteItem } from './types'
import { LoginPage } from './components/LoginPage'
import { SignupPage } from './components/SignupPage'
import { SplashScreen } from './components/SplashScreen'
import { RecorderPanel } from './components/RecorderPanel'
import { NotesPanel } from './components/NotesPanel'
import { SnapshotsPanel } from './components/SnapshotsPanel'
import { SummaryPanel } from './components/SummaryPanel'
import { ExportPanel } from './components/ExportPanel'
import { SessionsList } from './components/SessionsList'
import { ThemeToggle } from './components/ThemeToggle'
import * as sessionsApi from './lib/sessions'

type TabId = 'record' | 'notes' | 'snapshots' | 'summary' | 'export'

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'record', label: 'Record', icon: '⏺' },
  { id: 'notes', label: 'Notes', icon: '📝' },
  { id: 'snapshots', label: 'Snapshots', icon: '📷' },
  { id: 'summary', label: 'Summary', icon: '📋' },
  { id: 'export', label: 'Export PDF', icon: '📄' },
]

const SAVE_DEBOUNCE_MS = 2000

function MainApp() {
  const auth = useAuth()
  const [showAuth, setShowAuth] = useState<'login' | 'signup'>('login')
  const [showSplash, setShowSplash] = useState(true)
  const [activeTab, setActiveTab] = useState<TabId>('record')
  const [sessionList, setSessionList] = useState<sessionsApi.SessionRow[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [sessionsLoading, setSessionsLoading] = useState(true)
  const [sessionTitle, setSessionTitle] = useState('')
  const [notes, setNotes] = useState<NoteItem[]>([])
  const [snapshots, setSnapshots] = useState<SnapshotItem[]>([])
  const [transcript, setTranscript] = useState('')
  const [summary, setSummary] = useState('')
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const recorderRef = useRef<{
    addSnapshot: (dataUrl: string, label: string) => void
    getTranscript: () => string
    stop: () => void
  } | null>(null)
  const [mobileSessionsOpen, setMobileSessionsOpen] = useState(false)

  const userId = auth.user?.id ?? ''

  const loadSessions = useCallback(async () => {
    if (!userId) return
    setSessionsLoading(true)
    try {
      const list = await sessionsApi.fetchSessions(userId)
      setSessionList(list)
      if (list.length > 0 && !currentSessionId) {
        setCurrentSessionId(list[0].id)
      }
    } catch (e) {
      console.error('Failed to load sessions', e)
    } finally {
      setSessionsLoading(false)
    }
  }, [userId, currentSessionId])

  useEffect(() => {
    if (userId) loadSessions()
  }, [userId, loadSessions])

  const loadSessionIntoState = useCallback((s: sessionsApi.SessionRow) => {
    setCurrentSessionId(s.id)
    setSessionTitle(s.title)
    setNotes(s.notes)
    setSnapshots(s.snapshots)
    setTranscript(s.transcript)
    setSummary(s.summary)
  }, [])

  useEffect(() => {
    if (!currentSessionId || sessionsLoading) return
    const s = sessionList.find((x) => x.id === currentSessionId)
    if (s) loadSessionIntoState(s)
  }, [currentSessionId, sessionsLoading, loadSessionIntoState])

  const saveCurrentSession = useCallback(async () => {
    if (!currentSessionId || !userId) return
    try {
      await sessionsApi.updateSession(currentSessionId, {
        title: sessionTitle,
        transcript,
        summary,
        notes,
        snapshots,
      })
    } catch (e) {
      console.error('Failed to save session', e)
    }
  }, [currentSessionId, userId, sessionTitle, transcript, summary, notes, snapshots])

  useEffect(() => {
    if (!currentSessionId) return
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => {
      saveCurrentSession()
      saveTimeoutRef.current = null
    }, SAVE_DEBOUNCE_MS)
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [currentSessionId, sessionTitle, transcript, summary, notes, snapshots, saveCurrentSession])

  const handleNewSession = useCallback(async () => {
    if (!userId) return
    try {
      const newSession = await sessionsApi.createSession(userId)
      setSessionList((prev) => [newSession, ...prev])
      loadSessionIntoState(newSession)
    } catch (e) {
      console.error('Failed to create session', e)
    }
  }, [userId, loadSessionIntoState])

  const handleRecordingComplete = useCallback(
    async (blob: Blob) => {
      if (!currentSessionId || !userId) return
      try {
        const url = await sessionsApi.uploadRecording(currentSessionId, userId, blob)
        await sessionsApi.updateSession(currentSessionId, { recording_url: url })
        const list = await sessionsApi.fetchSessions(userId)
        setSessionList(list)
      } catch (e) {
        console.error('Failed to upload recording', e)
      }
    },
    [currentSessionId, userId]
  )

  const addNote = useCallback((content: string) => {
    setNotes((prev) => [...prev, { id: crypto.randomUUID(), timestamp: Date.now(), content }])
  }, [])

  const addSnapshot = useCallback((dataUrl: string, label: string) => {
    setSnapshots((prev) => [
      ...prev,
      { id: crypto.randomUUID(), timestamp: Date.now(), label: label || `Snapshot ${prev.length + 1}`, dataUrl },
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

  if (auth.loading) {
    return (
      <div className="min-h-screen bg-[#0f0f12] flex items-center justify-center text-zinc-500">
        Loading…
      </div>
    )
  }

  if (!auth.user) {
    return (
      <>
        <Analytics />
        {showAuth === 'login' ? (
          <LoginPage auth={auth} onSwitchToSignup={() => setShowAuth('signup')} />
        ) : (
          <SignupPage auth={auth} onSwitchToLogin={() => setShowAuth('login')} />
        )}
      </>
    )
  }

  if (showSplash) {
    return (
      <>
        <Analytics />
        <SplashScreen onEnter={() => setShowSplash(false)} />
      </>
    )
  }

  return (
    <>
      <Analytics />
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans flex">
        <aside className="w-56 shrink-0 border-r border-[var(--border)] bg-[var(--surface)] p-3 hidden sm:block">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-white text-sm">Sessions</span>
            <button
              type="button"
              onClick={() => auth.signOut()}
              className="text-xs text-zinc-500 hover:text-white"
            >
              Log out
            </button>
          </div>
          <SessionsList
            sessions={sessionList}
            currentId={currentSessionId}
            onSelect={setCurrentSessionId}
            onNew={handleNewSession}
            loading={sessionsLoading}
          />
        </aside>
        {mobileSessionsOpen && (
          <>
            <div className="fixed inset-0 z-20 bg-black/60 sm:hidden" onClick={() => setMobileSessionsOpen(false)} aria-hidden />
            <div className="fixed left-0 top-0 bottom-0 z-20 w-72 bg-[var(--surface)] p-4 shadow-xl sm:hidden">
              <div className="flex justify-between items-center mb-3">
                <span className="font-semibold text-white">Sessions</span>
                <button type="button" onClick={() => setMobileSessionsOpen(false)} className="text-zinc-500 p-2">✕</button>
              </div>
              <SessionsList
                sessions={sessionList}
                currentId={currentSessionId}
                onSelect={(id) => { setCurrentSessionId(id); setMobileSessionsOpen(false) }}
                onNew={() => { handleNewSession(); setMobileSessionsOpen(false) }}
                loading={sessionsLoading}
              />
            </div>
          </>
        )}
        <div className="flex-1 min-w-0 flex flex-col">
          <header className="border-b border-zinc-800 bg-[#18181c] px-3 py-3 sm:px-4 sticky top-0 z-10 pt-[env(safe-area-inset-top)]">
            <div className="max-w-6xl mx-auto flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="flex items-center justify-between gap-2 min-w-0">
                <h1 className="font-display font-semibold text-base sm:text-lg text-[var(--text)] truncate">EasyNote</h1>
                <ThemeToggle />
                <div className="flex gap-2 sm:hidden">
                  <button
                    type="button"
                    onClick={() => setMobileSessionsOpen(true)}
                    className="text-zinc-400 text-sm px-2 py-1 rounded border border-zinc-600"
                  >
                    Sessions
                  </button>
                  <button type="button" onClick={() => auth.signOut()} className="text-zinc-500 text-sm">
                    Log out
                  </button>
                </div>
              </div>
              <input
                type="text"
                placeholder="What’s this? (e.g. Meeting, call, workshop)"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                className="w-full sm:flex-1 sm:min-w-[180px] bg-[var(--input-bg)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] min-h-[44px] sm:min-h-0"
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

          <main className="max-w-6xl mx-auto p-3 sm:p-4 pb-8 w-full flex-1">
            {!currentSessionId && !sessionsLoading ? (
              <div className="py-8 text-center text-zinc-500">
                <p className="mb-4">Create a session to start.</p>
                <button
                  type="button"
                  onClick={handleNewSession}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500"
                >
                  New session
                </button>
              </div>
            ) : (
              <>
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
                    onRecordingComplete={handleRecordingComplete}
                  />
                )}
                {activeTab === 'notes' && <NotesPanel notes={notes} onAddNote={addNote} />}
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
              </>
            )}
          </main>
        </div>
      </div>
    </>
  )
}

export default function App() {
  return <MainApp />
}
