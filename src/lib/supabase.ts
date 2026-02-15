import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Auth and persistence will not work.')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

export type DbSession = {
  id: string
  user_id: string
  title: string
  transcript: string
  summary: string
  notes: { id: string; timestamp: number; content: string }[]
  snapshots: { id: string; timestamp: number; label: string; dataUrl: string }[]
  recording_url: string | null
  created_at: string
  updated_at: string
}
