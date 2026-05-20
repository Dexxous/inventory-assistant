'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'

export default function UsersPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'USER', team: '' })
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [editingRole, setEditingRole] = useState(null)

  const fetchUsers = () => {
    fetch('/api/users')
      .then(r => r.json())
      .then(data => { setUsers(data.users ?? []); setLoading(false) })
  }

  useEffect(() => { fetchUsers() }, [])

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password) {
      setError('Jméno, email a heslo jsou povinné')
      return
    }
    setCreating(true)
    setError(null)
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    const data = await res.json()
    setCreating(false)
    if (data.success) {
      setSuccess('Uživatel byl vytvořen')
      setForm({ name: '', email: '', password: '', role: 'USER', team: '' })
      fetchUsers()
      setTimeout(() => setSuccess(null), 3000)
    } else {
      setError(data.error ?? 'Nepodařilo se vytvořit uživatele')
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    const res = await fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole })
    })
    if (res.ok) {
      setSuccess('Role byla změněna')
      setEditingRole(null)
      fetchUsers()
      setTimeout(() => setSuccess(null), 3000)
    }
  }

  const handleDelete = async (userId) => {
    if (!confirm('Opravdu chcete smazat tohoto uživatele?')) return
    await fetch(`/api/users/${userId}`, { method: 'DELETE' })
    fetchUsers()
  }

  if (session?.user?.role !== 'ADMIN') {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Nemáte oprávnění k této stránce.</p>
      </main>
    )
  }

  const roleLabel = { ADMIN: 'Admin', USER: 'Uživatel', MANAGER: 'Manager' }
  const roleColor = {
    ADMIN: 'bg-red-50 text-red-600',
    USER: 'bg-blue-50 text-[#0073E6]',
    MANAGER: 'bg-purple-50 text-purple-600'
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Image src="/atos-logo.svg" alt="Atos" width={80} height={27} />
          <a href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600">← Dashboard</a>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-center justify-between mt-4 mb-6">
          <h1 className="text-xl font-bold text-gray-900">Správa uživatelů</h1>
          <span className="text-sm text-gray-400">{users.length} uživatelů</span>
        </div>

        {/* Notifikace */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm mb-4">
            ✓ {success}
          </div>
        )}

        {/* Formulář nového uživatele */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">➕ Nový uživatel</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              placeholder="Celé jméno *"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073E6]"
            />
            <input
              placeholder="Email *"
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073E6]"
            />
            <input
              placeholder="Heslo *"
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073E6]"
            />
            <input
              placeholder="Tým"
              value={form.team}
              onChange={e => setForm({ ...form, team: e.target.value })}
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073E6]"
            />
            <select
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073E6] bg-white"
            >
              <option value="USER">Uživatel</option>
              <option value="MANAGER">Manager</option>
              <option value="ADMIN">Admin</option>
            </select>
            <button
              onClick={handleCreate}
              disabled={creating}
              className="bg-[#0073E6] text-white px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
            >
              {creating ? 'Vytvářím...' : '+ Vytvořit uživatele'}
            </button>
          </div>
        </div>

        {/* Seznam uživatelů */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Všichni uživatelé</h2>
          </div>

          {loading ? (
            <p className="text-center text-gray-400 py-12">Načítám...</p>
          ) : users.length === 0 ? (
            <p className="text-center text-gray-400 py-12">Žádní uživatelé</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {users.map(u => (
                <div key={u.id} className="px-5 py-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 truncate">{u.name}</p>
                      {u.id === session?.user?.id && (
                        <span className="text-xs text-gray-400">(vy)</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{u.email}</p>
                    {u.team && <p className="text-xs text-gray-400">🏢 {u.team}</p>}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {editingRole === u.id ? (
                      <div className="flex items-center gap-2">
                        <select
                          defaultValue={u.role}
                          onChange={e => handleRoleChange(u.id, e.target.value)}
                          className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#0073E6] bg-white"
                        >
                          <option value="USER">Uživatel</option>
                          <option value="MANAGER">Manager</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                        <button
                          onClick={() => setEditingRole(null)}
                          className="text-xs text-gray-400 hover:text-gray-600"
                        >
                          Zrušit
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${roleColor[u.role]}`}>
                          {roleLabel[u.role]}
                        </span>
                        <button
                          onClick={() => setEditingRole(u.id)}
                          className="text-xs text-gray-400 hover:text-[#0073E6] transition-colors"
                        >
                          Upravit
                        </button>
                        {u.id !== session?.user?.id && (
                          <button
                            onClick={() => handleDelete(u.id)}
                            className="text-xs text-gray-300 hover:text-red-500 transition-colors"
                          >
                            Smazat
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}