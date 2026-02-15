# EasyNote

A simple web app to **record** meetings, calls, workshops, or anything else — **transcribe** speech live, **take notes**, **capture snapshots**, **summarize**, and **export to PDF**. So you **don’t miss anything**.

## Features

- **Sign up / Sign in** — Only logged-in users can access the app; your data is tied to your account.
- **Record** — Voice only, microphone + camera, or **screen + microphone** (e.g. video calls, demos). Recordings are saved to your account.
- **Live transcript** — Speech-to-text while you record (Chrome recommended).
- **Notes** — Add timestamped notes; they’re saved automatically so you don’t lose anything.
- **Snapshots** — Capture frames during recording or upload images; all stored per session.
- **Summary** — Generate a short summary from the transcript or write key points yourself.
- **Export PDF** — One PDF with title, summary, notes, transcript, and snapshots.
- **Sessions** — Multiple sessions per user; switch between them or create a new one. Everything is saved and available whenever you log in again.

## Setup (required for auth and saving data)

1. Create a project at [Supabase](https://supabase.com).
2. In the Supabase **SQL Editor**, run the script in `supabase/schema.sql` to create the `sessions` table and storage bucket.
3. Copy `.env.example` to `.env` and set your Supabase URL and anon key (from Project Settings → API):
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
4. In Supabase **Authentication → Providers**, enable **Email** (sign up with email/password).

## Quick start

```bash
cd session-capture-app
npm install
npm run dev
```

Open **http://localhost:5173**. Sign up or sign in to access the app. Your notes, transcript, summary, snapshots, and recording links are saved and available every time you log in.

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
- Supabase (Auth + PostgreSQL + Storage)
- Tailwind CSS
- Browser APIs: MediaRecorder, getDisplayMedia/getUserMedia, Web Speech API
- jsPDF for PDF export
