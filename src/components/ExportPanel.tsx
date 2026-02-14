import { useRef } from 'react'
import { jsPDF } from 'jspdf'
import type { NoteItem, SnapshotItem } from '../types'

interface ExportPanelProps {
  sessionTitle: string
  notes: NoteItem[]
  snapshots: SnapshotItem[]
  summary: string
  transcript: string
}

function formatTime(ms: number) {
  const d = new Date(ms)
  return d.toLocaleString()
}

export function ExportPanel({
  sessionTitle,
  notes,
  snapshots,
  summary,
  transcript,
}: ExportPanelProps) {
  const previewRef = useRef<HTMLDivElement>(null)

  const generatePdf = async () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const pageW = doc.internal.pageSize.getWidth()
    const margin = 40
    let y = 40

    const addText = (text: string, fontSize: number, isBold = false) => {
      doc.setFontSize(fontSize)
      doc.setFont('helvetica', isBold ? 'bold' : 'normal')
      const lines = doc.splitTextToSize(text, pageW - 2 * margin)
      for (const line of lines) {
        if (y > doc.internal.pageSize.getHeight() - 50) {
          doc.addPage()
          y = 40
        }
        doc.text(line, margin, y)
        y += fontSize * 0.4
      }
      y += 8
    }

    addText(sessionTitle || 'EasyNote', 18, true)
    addText(`Generated: ${formatTime(Date.now())}`, 10)
    y += 10

    if (summary) {
      addText('Summary', 14, true)
      addText(summary, 10)
      y += 10
    }

    if (notes.length > 0) {
      addText('Notes', 14, true)
      for (const n of notes) {
        addText(`${formatTime(n.timestamp)} — ${n.content}`, 10)
      }
      y += 10
    }

    if (transcript) {
      addText('Transcript', 14, true)
      addText(transcript.slice(0, 4000) + (transcript.length > 4000 ? '…' : ''), 9)
      y += 10
    }

    if (snapshots.length > 0) {
      addText('Snapshots', 14, true)
      for (let i = 0; i < snapshots.length; i++) {
        const s = snapshots[i]
        try {
          const imgW = pageW - 2 * margin
          const imgH = 120
          if (y + imgH > doc.internal.pageSize.getHeight() - 40) {
            doc.addPage()
            y = 40
          }
          doc.addImage(s.dataUrl, 'JPEG', margin, y, imgW, imgH)
          y += imgH + 4
          doc.setFontSize(9)
          doc.text(s.label, margin, y)
          y += 20
        } catch (_) {
          addText(`[Image ${i + 1}: ${s.label}]`, 9)
        }
      }
    }

    doc.save(`${(sessionTitle || 'EasyNote').replace(/[^a-z0-9]/gi, '-')}-${Date.now()}.pdf`)
  }

  return (
    <div className="space-y-6">
      <p className="text-zinc-400 text-sm">
        Export title, summary, notes, transcript, and snapshots into one PDF — so you keep everything in one place.
      </p>
      <button
        onClick={generatePdf}
        className="w-full sm:w-auto px-6 py-3 min-h-[48px] bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-500 active:bg-indigo-500"
      >
        Download PDF
      </button>
      <div
        ref={previewRef}
        className="rounded-xl bg-zinc-900/80 border border-zinc-800 p-4 sm:p-6 text-sm text-zinc-300 space-y-4 max-h-[50vh] overflow-y-auto"
      >
        <h3 className="text-zinc-400 font-medium">Preview (what will be in the PDF)</h3>
        <p className="font-semibold text-white">{sessionTitle || 'EasyNote'}</p>
        {summary && (
          <>
            <p className="text-zinc-400 font-medium">Summary</p>
            <p className="whitespace-pre-wrap">{summary}</p>
          </>
        )}
        {notes.length > 0 && (
          <>
            <p className="text-zinc-400 font-medium">Notes</p>
            <ul className="list-disc list-inside space-y-1">
              {notes.map((n) => (
                <li key={n.id}>
                  {formatTime(n.timestamp)} — {n.content}
                </li>
              ))}
            </ul>
          </>
        )}
        {snapshots.length > 0 && (
          <>
            <p className="text-zinc-400 font-medium">Snapshots ({snapshots.length})</p>
            <p className="text-zinc-500">Included in PDF.</p>
          </>
        )}
      </div>
    </div>
  )
}
