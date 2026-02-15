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
    const pageH = doc.internal.pageSize.getHeight()
    const margin = 50
    const footerH = 28
    let y = margin
    let pageNum = 1

    const addFooter = () => {
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(128, 128, 128)
      doc.text(`EasyNote · Page ${pageNum}`, margin, pageH - 14)
      doc.text(formatTime(Date.now()), pageW - margin - 80, pageH - 14)
      doc.setTextColor(0, 0, 0)
      pageNum += 1
    }

    const addText = (text: string, fontSize: number, isBold = false) => {
      doc.setFontSize(fontSize)
      doc.setFont('helvetica', isBold ? 'bold' : 'normal')
      const lines = doc.splitTextToSize(text, pageW - 2 * margin)
      for (const line of lines) {
        if (y > pageH - footerH - 20) {
          addFooter()
          doc.addPage()
          y = margin
        }
        doc.text(line, margin, y)
        y += fontSize * 0.45
      }
      y += 6
    }

    const addSectionHeader = (title: string) => {
      if (y > pageH - footerH - 40) {
        addFooter()
        doc.addPage()
        y = margin
      }
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(79, 70, 229)
      doc.text(title, margin, y)
      y += 4
      doc.setDrawColor(200, 200, 200)
      doc.line(margin, y, pageW - margin, y)
      y += 16
      doc.setTextColor(0, 0, 0)
    }

    // Cover page
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(79, 70, 229)
    doc.text('EasyNote', margin, 80)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 100, 100)
    doc.text('Session notes & recording summary', margin, 100)
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(sessionTitle || 'Untitled session', margin, 140)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(128, 128, 128)
    doc.text(`Generated ${formatTime(Date.now())}`, margin, 160)
    doc.setTextColor(0, 0, 0)
    y = 200
    addFooter()
    doc.addPage()
    y = margin
    pageNum = 2

    if (summary) {
      addSectionHeader('Summary')
      addText(summary, 10)
      y += 8
    }

    if (notes.length > 0) {
      addSectionHeader('Notes')
      for (const n of notes) {
        addText(`${formatTime(n.timestamp)} — ${n.content}`, 10)
      }
      y += 8
    }

    if (transcript) {
      addSectionHeader('Transcript')
      addText(transcript.slice(0, 5000) + (transcript.length > 5000 ? '…' : ''), 9)
      y += 8
    }

    if (snapshots.length > 0) {
      addSectionHeader('Snapshots')
      for (let i = 0; i < snapshots.length; i++) {
        const s = snapshots[i]
        try {
          const imgW = pageW - 2 * margin
          const imgH = 140
          if (y + imgH > pageH - footerH - 20) {
            addFooter()
            doc.addPage()
            y = margin
          }
          doc.addImage(s.dataUrl, 'JPEG', margin, y, imgW, imgH)
          y += imgH + 6
          doc.setFontSize(9)
          doc.setTextColor(100, 100, 100)
          doc.text(s.label, margin, y)
          doc.setTextColor(0, 0, 0)
          y += 18
        } catch (_) {
          addText(`[Image ${i + 1}: ${s.label}]`, 9)
        }
      }
    }

    addFooter()
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
