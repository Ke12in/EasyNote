import { useRef } from 'react'
import type { SnapshotItem } from '../types'

interface SnapshotsPanelProps {
  snapshots: SnapshotItem[]
  onCapture: () => void
  onAddSnapshot: (dataUrl: string, label: string) => void
  isRecording?: boolean
}

function formatTime(ms: number) {
  const d = new Date(ms)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export function SnapshotsPanel({
  snapshots,
  onCapture,
  onAddSnapshot,
  isRecording = false,
}: SnapshotsPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      onAddSnapshot(dataUrl, file.name)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button
          onClick={onCapture}
          disabled={!isRecording}
          title={isRecording ? 'Capture current frame from live recording' : 'Start a recording first to capture frames'}
          className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] sm:min-h-0 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-500 active:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          📷 Capture from recording
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] sm:min-h-0 bg-zinc-700 text-white rounded-lg text-sm font-medium hover:bg-zinc-600 active:bg-zinc-600"
        >
          Upload image
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />
      </div>
      <div>
        <h3 className="text-sm font-medium text-zinc-400 mb-3">Snapshots</h3>
        {snapshots.length === 0 ? (
          <p className="text-zinc-500 text-sm">Capture a frame during recording or upload an image so you don’t miss visual details.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
            {snapshots.map((s) => (
              <div
                key={s.id}
                className="rounded-lg overflow-hidden border border-zinc-700 bg-zinc-800/80 min-w-0"
              >
                <img
                  src={s.dataUrl}
                  alt={s.label}
                  className="w-full aspect-video object-cover"
                />
                <p className="px-2 py-1.5 text-xs text-zinc-400 truncate" title={s.label}>
                  {s.label}
                </p>
                <p className="px-2 pb-2 text-xs text-zinc-500">{formatTime(s.timestamp)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
