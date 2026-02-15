import { useState } from 'react'
import type { AuthContextType } from '../context/AuthContext'

type Props = {
  auth: AuthContextType
  onSwitchToSignup: () => void
}

export function LoginPage({ auth, onSwitchToSignup }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await auth.signIn(email, password)
    setLoading(false)
    if (err) setError(err.message)
  }

  return (
    <div className="min-h-screen bg-[#0f0f12] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="font-display font-bold text-2xl text-white text-center">EasyNote</h1>
        <p className="text-zinc-400 text-sm text-center">Sign in to access your notes and recordings.</p>
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
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="text-zinc-500 text-sm text-center">
          No account?{' '}
          <button type="button" onClick={onSwitchToSignup} className="text-indigo-400 hover:underline">
            Sign up
          </button>
        </p>
      </div>
    </div>
  )
}
