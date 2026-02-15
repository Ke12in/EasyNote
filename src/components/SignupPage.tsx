import { useState } from 'react'
import type { AuthContextType } from '../context/AuthContext'

type Props = {
  auth: AuthContextType
  onSwitchToLogin: () => void
}

export function SignupPage({ auth, onSwitchToLogin }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    const { error: err } = await auth.signUp(email, password)
    setLoading(false)
    if (err) {
      setError(err.message)
      return
    }
    setMessage('Check your email to confirm your account, then sign in.')
  }

  return (
    <div className="min-h-screen bg-[#0f0f12] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="font-display font-bold text-2xl text-white text-center">EasyNote</h1>
        <p className="text-zinc-400 text-sm text-center">Create an account to save your notes and recordings.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          {message && <p className="text-green-400 text-sm">{message}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Creating account…' : 'Sign up'}
          </button>
        </form>
        <p className="text-zinc-500 text-sm text-center">
          Already have an account?{' '}
          <button type="button" onClick={onSwitchToLogin} className="text-indigo-400 hover:underline">
            Sign in
          </button>
        </p>
      </div>
    </div>
  )
}
