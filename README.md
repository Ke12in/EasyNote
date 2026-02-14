# EasyNote

A simple web app to **record** meetings, calls, workshops, or anything else — **transcribe** speech live, **take notes**, **capture snapshots**, **summarize**, and **export to PDF**. So you **don’t miss anything**.

## Features

- **Record** — Voice only, microphone + camera, or **screen + microphone** (e.g. video calls, demos)
- **Live transcript** — Speech-to-text while you record (Chrome recommended)
- **Notes** — Add timestamped notes during or after so nothing slips through
- **Snapshots** — Capture frames during recording or upload images
- **Summary** — Generate a short summary from the transcript or write key points yourself
- **Export PDF** — One PDF with title, summary, notes, transcript, and snapshots — everything in one place

## Quick start

```bash
cd session-capture-app
npm install
npm run dev
```

Open **http://localhost:5173** in your browser (Chrome works best for recording and speech recognition).

## How to use

1. **Record** — Give it a title (e.g. “Team standup”, “Client call”, “Workshop”), choose Voice only, Mic + Camera, or Screen + Mic, then **Start recording**. Use **Snapshot** to grab the current frame; **Stop** when done. The file downloads automatically; the transcript appears as you speak.
2. **Notes** — Add notes anytime; they’re timestamped so you don’t miss follow-ups or action items.
3. **Snapshots** — Capture a frame during recording or upload an image so you don’t miss visual details.
4. **Summary** — Generate a summary from the transcript or type key points so nothing gets lost.
5. **Export PDF** — Download one PDF with everything: title, summary, notes, transcript, and snapshots.

## Tips

- Use **Chrome** for the best experience (recording + speech recognition).
- For **screen recording** (e.g. a Zoom call or demo), choose “Screen + Mic” and share the window or tab.
- You can **edit the summary** by hand; it doesn’t have to come only from “Generate summary”.

## Tech

- React 18 + TypeScript + Vite
- Tailwind CSS
- Browser APIs: MediaRecorder, getDisplayMedia/getUserMedia, Web Speech API
- jsPDF for PDF export

No backend or account required — everything runs in your browser.
