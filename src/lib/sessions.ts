import { supabase } from './supabase'
import type { NoteItem, SnapshotItem } from '../types'

export type SessionRow = {
  id: string
  title: string
  transcript: string
  summary: string
  notes: NoteItem[]
  snapshots: SnapshotItem[]
  recording_url: string | null
  created_at: string
  updated_at: string
}

export async function fetchSessions(userId: string): Promise<SessionRow[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select('id, title, transcript, summary, notes, snapshots, recording_url, created_at, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map((r: Record<string, unknown>) => ({
    id: r.id as string,
    title: (r.title as string) ?? '',
    transcript: (r.transcript as string) ?? '',
    summary: (r.summary as string) ?? '',
    notes: Array.isArray(r.notes) ? (r.notes as NoteItem[]) : [],
    snapshots: Array.isArray(r.snapshots) ? (r.snapshots as SnapshotItem[]) : [],
    recording_url: (r.recording_url as string | null) ?? null,
    created_at: r.created_at as string,
    updated_at: r.updated_at as string,
  }))
}

export async function createSession(userId: string): Promise<SessionRow> {
  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('sessions')
    .insert({
      user_id: userId,
      title: '',
      transcript: '',
      summary: '',
      notes: [],
      snapshots: [],
      recording_url: null,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single()
  if (error) throw error
  const r = data as Record<string, unknown>
  return {
    id: r.id as string,
    title: (r.title as string) ?? '',
    transcript: (r.transcript as string) ?? '',
    summary: (r.summary as string) ?? '',
    notes: Array.isArray(r.notes) ? (r.notes as NoteItem[]) : [],
    snapshots: Array.isArray(r.snapshots) ? (r.snapshots as SnapshotItem[]) : [],
    recording_url: (r.recording_url as string | null) ?? null,
    created_at: r.created_at as string,
    updated_at: r.updated_at as string,
  }
}

export async function updateSession(
  sessionId: string,
  payload: {
    title?: string
    transcript?: string
    summary?: string
    notes?: NoteItem[]
    snapshots?: SnapshotItem[]
    recording_url?: string | null
  }
): Promise<void> {
  const { error } = await supabase
    .from('sessions')
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sessionId)
  if (error) throw error
}

export async function deleteSession(sessionId: string): Promise<void> {
  const { error } = await supabase.from('sessions').delete().eq('id', sessionId)
  if (error) throw error
}

export async function uploadRecording(sessionId: string, userId: string, blob: Blob): Promise<string> {
  const path = `${userId}/${sessionId}-${Date.now()}.webm`
  const { error } = await supabase.storage.from('recordings').upload(path, blob, {
    contentType: blob.type,
    upsert: true,
  })
  if (error) throw error
  const { data: urlData } = supabase.storage.from('recordings').getPublicUrl(path)
  return urlData.publicUrl
}
