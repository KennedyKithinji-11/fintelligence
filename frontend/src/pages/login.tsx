import { useState, FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login, user, isLoading } = useAuth()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Already authenticated — redirect to dashboard
  if (!isLoading && user) return <Navigate to="/" replace />

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email, password)
      // login() updates AuthContext, which triggers Navigate above
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Login failed. Check your credentials.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050810] flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Fin<span className="text-[#00d4ff]">Telligence</span>
          </h1>
          <p className="text-[#7a83a6] text-sm">Financial Intelligence Platform</p>
        </div>

        {/* Form card */}
        <div className="bg-[#0f1629] border border-[#2a3560] rounded-lg p-8">
          <h2 className="text-white font-semibold text-lg mb-6">Sign In</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded p-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[#7a83a6] text-xs uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-[#050810] border border-[#2a3560] text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-[#00d4ff]"
                placeholder="analyst@firm.com"
              />
            </div>

            <div>
              <label className="block text-[#7a83a6] text-xs uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full bg-[#050810] border border-[#2a3560] text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-[#00d4ff]"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#00d4ff] text-[#050810] font-bold py-2.5 rounded text-sm hover:bg-[#00b8e0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-[#4a5270] text-xs mt-4">
          Contact your administrator to create an account.
        </p>
      </div>
    </div>
  )
}