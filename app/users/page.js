'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { SlidersHorizontal, X } from 'lucide-react'

export default function UsersPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'USER', team: '' })
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [editingRole, setEditingRole] = useState(null)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [filterTeam, setFilterTeam] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [showFilters, setShowFilters] = useState(false)

  const fetchUsers = () => {
    fetch('/api/users')
      .then(r => r.json())
      .then(data => { setUsers(data.users ?? []); setLoading(false) })
  }

  useEffect(() => { fetchUsers() }, [])

  const teams = [...new Set(users.map(u => u.team).filter(Boolean))].sort()
  const activeFilters = [filterRole, filterTeam].filter(Boolean).length

  const filtered = users
    .filter(u =>
      (u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())) &&
      (filterRole ? u.role === filterRole : true) &&
      (filterTeam ? u.team === filterTeam : true)
    )
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'email') return a.email.localeCompare(b.email)
      if (sortBy === 'role') return a.role.localeCompare(b.role)
      if (sortBy === 'team') return (a.team ?? '').localeCompare(b.team ?? '')
      return 0
    })

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
      <main className="min-h-screen bg-[#f4f5f7] flex items-center justify-center">
        <p className="text-gray-500">Nemáte oprávnění k této stránce.</p>
      </main>
    )
  }

  const roleLabel = { ADMIN: 'Admin', USER: 'Uživatel', MANAGER: 'Manager' }
  const roleColor = {
    ADMIN: 'bg-red-50 text-red-600 border-red-100',
    USER: 'bg-blue-50 text-[#0073E6] border-blue-100',
    MANAGER: 'bg-purple-50 text-purple-600 border-purple-100'
  }

  return (
    <main className="min-h-screen bg-[#f4f5f7]">
      <nav className="bg-white border-b border-gray-200 px-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between h-12">
          <Image src="/atos-logo.svg" alt="Atos" width={64} height={22} />
          <a href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600 hover:underline transition-all duration-200">← Dashboard</a>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-5">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-gray-900">Správa uživatelů</h1>
          <span className="text-xs text-gray-400 bg-white border border-gray-200 px-2.5 py-1 rounded-lg">
            {filtered.length} / {users.length}
          </span>
        </div>

        {/* Notifikace */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm mb-4">
            ✓ {success}
          </div>
        )}

        {/* Formulář nového uživatele */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <h2 className="font-semibold text-gray-800 text-sm mb-3">Nový uživatel</h2>
          <div className="grid grid-cols-2 gap-2">
            <input
              placeholder="Celé jméno *"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073E6]/30"
            />
            <input
              placeholder="Email *"
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073E6]/30"
            />
            <input
              placeholder="Heslo *"
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073E6]/30"
            />
            <input
              placeholder="Tým"
              value={form.team}
              onChange={e => setForm({ ...form, team: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073E6]/30"
            />
            <select
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073E6]/30 bg-white"
            >
              <option value="USER">Uživatel</option>
              <option value="MANAGER">Manager</option>
              <option value="ADMIN">Admin</option>
            </select>
            <button
              onClick={handleCreate}
              disabled={creating}
              className="bg-[#0073E6] hover:bg-[#0064c4] hover:scale-105 hover:shadow-lg active:bg-[#005cc4] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none disabled:hover:bg-[#0073E6]"
            >
              {creating ? 'Vytvářím...' : '+ Vytvořit'}
            </button>
          </div>
        </div>

        {/* Hledání + filtr */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="Hledat podle jména nebo emailu..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073E6]/30 focus:border-[#0073E6] transition-all"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 hover:scale-105 hover:shadow-md ${

              showFilters || activeFilters > 0
                ? 'bg-[#0073E6] text-white border-[#0073E6]'
                : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            <SlidersHorizontal size={15} />
            {activeFilters > 0 && (
              <span className="bg-white text-[#0073E6] text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {activeFilters}
              </span>
            )}
          </button>
        </div>

        {/* Filtry panel */}
        {showFilters && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-3 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5">Role</label>
                <select
                  value={filterRole}
                  onChange={e => setFilterRole(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073E6]/30 bg-white"
                >
                  <option value="">Všechny role</option>
                  <option value="ADMIN">Admin</option>
                  <option value="MANAGER">Manager</option>
                  <option value="USER">Uživatel</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5">Tým</label>
                <select
                  value={filterTeam}
                  onChange={e => setFilterTeam(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073E6]/30 bg-white"
                >
                  <option value="">Všechny týmy</option>
                  {teams.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5">Seřadit podle</label>
              <div className="flex gap-2">
                {[
                  { value: 'name', label: 'Jméno' },
                  { value: 'email', label: 'Email' },
                  { value: 'role', label: 'Role' },
                  { value: 'team', label: 'Tým' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setSortBy(opt.value)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 hover:scale-105 hover:shadow-sm ${

                      sortBy === opt.value
                        ? 'bg-[#0073E6] text-white border-[#0073E6]'
                        : 'bg-gray-50 text-gray-600 border-gray-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {(activeFilters > 0 || sortBy !== 'name') && (
              <button
                onClick={() => { setFilterRole(''); setFilterTeam(''); setSortBy('name') }}
                className="flex items-center gap-1.5 text-xs text-red-500 font-medium"
              >
                <X size={12} />
                Zrušit filtry
              </button>
            )}
          </div>
        )}

        {/* Aktivní filtry tagy */}
        {(filterRole || filterTeam) && (
          <div className="flex gap-2 mb-3 flex-wrap">
            {filterRole && (
              <span className="flex items-center gap-1.5 text-xs bg-blue-50 text-[#0073E6] border border-blue-200 px-2.5 py-1 rounded-full font-medium">
                {roleLabel[filterRole]}
                <button onClick={() => setFilterRole('')}><X size={10} /></button>
              </span>
            )}
            {filterTeam && (
              <span className="flex items-center gap-1.5 text-xs bg-blue-50 text-[#0073E6] border border-blue-200 px-2.5 py-1 rounded-full font-medium">
                {filterTeam}
                <button onClick={() => setFilterTeam('')}><X size={10} /></button>
              </span>
            )}
          </div>
        )}

        {/* Seznam uživatelů */}
        {loading ? (
          <p className="text-center text-gray-400 py-12 text-sm">Načítám...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-400 py-12 text-sm">Žádní uživatelé</p>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-50">
              {filtered.map(u => (
                <div key={u.id} className="px-4 py-3.5 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 text-sm truncate">{u.name}</p>
                      {u.id === session?.user?.id && (
                        <span className="text-[10px] text-gray-400 shrink-0">(vy)</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                    {u.team && <p className="text-xs text-gray-400">{u.team}</p>}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {editingRole === u.id ? (
                      <div className="flex items-center gap-2">
                        <select
                          defaultValue={u.role}
                          onChange={e => handleRoleChange(u.id, e.target.value)}
                          className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#0073E6]/30"
                        >
                          <option value="USER">Uživatel</option>
                          <option value="MANAGER">Manager</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                        <button
                          onClick={() => setEditingRole(null)}
                          className="text-xs text-gray-400"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${roleColor[u.role]}`}>
                          {roleLabel[u.role]}
                        </span>
                        <button
                          onClick={() => setEditingRole(u.id)}
                          className="text-xs text-gray-400 hover:text-[#0073E6] transition-colors font-medium"
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
          </div>
        )}
        <div className="h-6" />
      </div>
    </main>
  )
}