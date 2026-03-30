import { useState, useEffect } from 'react'
import client from '../api/client'

interface AdminUser {
  id: number; email: string; role: string; full_name: string; is_active: boolean
}

export default function Admin() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState<string | null>(null)

  useEffect(() => {
    client.get('/admin/users')
      .then(r => setUsers(r.data))
      .catch(e => setError(e?.response?.data?.detail || 'Failed to load users'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-[#050810] text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>

      {loading && <p className="text-[#7a83a6]">Loading users...</p>}
      {error && <p className="text-red-400">{error}</p>}

      {!loading && !error && (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="text-left text-[#7a83a6] border-b border-[#2a3560]">
              <th className="pb-3 pr-6">Email</th>
              <th className="pb-3 pr-6">Name</th>
              <th className="pb-3 pr-6">Role</th>
              <th className="pb-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-[#2a3560]/50">
                <td className="py-3 pr-6">{u.email}</td>
                <td className="py-3 pr-6">{u.full_name}</td>
                <td className="py-3 pr-6 text-[#00d4ff]">{u.role}</td>
                <td className="py-3">
                  <span className={u.is_active ? 'text-green-400' : 'text-red-400'}>
                    {u.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}