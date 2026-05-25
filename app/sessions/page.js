'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'

export default function SessionsPage() {
  const { data: session } = useSession()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)

  const fetchSessions = () => {
    fetch('/api/sessions')
      .then(r => r.json())
      .then(data => { setSessions(data.sessions ?? []); setLoading(false) })
  }

  useEffect(() => { fetchSessions() }, [])

  const handleCreate = async () => {
    if (!newName.trim()) return
    setCreating(true)
    await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName })
    })
    setNewName('')
    setCreating(false)
    fetchSessions()
  }

  const handlePhase = async (id, phase) => {
    await fetch(`/api/sessions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phase })
    })
    fetchSessions()
  }

  const handleToggleActive = async (id, active) => {
    await fetch(`/api/sessions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active })
    })
    fetchSessions()
  }

  if (session?.user?.role !== 'ADMIN') {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Nemáte oprávnění k této stránce.</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/atos-logo.svg" alt="Atos" width={80} height={27} />
            <div className="border-l border-gray-300 h-6"></div>
            <span className="text-sm font-semibold text-gray-700">InventarizaceTool</span>
          </div>
          <a href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600 hover:underline transition-all duration-200">← Dashboard</a>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-xl font-bold text-gray-900 mt-4 mb-6">Správa inventur</h1>

        {/* Vytvoření nové inventury */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <h2 className="font-semibold text-gray-800 mb-3">Nová inventura</h2>
          <div className="flex gap-2">
            <input
              placeholder="Název inventury (např. Inventura Q1 2025)"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073E6]"
            />
            <button
              onClick={handleCreate}
              disabled={creating}
              className="bg-[#0073E6] hover:bg-[#0064c4] hover:scale-105 hover:shadow-lg active:bg-[#005cc4] text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none disabled:hover:bg-[#0073E6] whitespace-nowrap"
            >
              {creating ? 'Vytvářím...' : '+ Vytvořit'}
            </button>
          </div>
        </div>

        {/* Seznam inventur */}
        {loading ? (
          <p className="text-center text-gray-400 py-12">Načítám...</p>
        ) : sessions.length === 0 ? (
          <p className="text-center text-gray-400 py-12">Žádné inventury</p>
        ) : (
          <div className="space-y-3">
            {sessions.map(s => (
              <div key={s.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{s.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(s.createdAt).toLocaleDateString('cs-CZ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      s.active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {s.active ? '● Aktivní' : '○ Neaktivní'}
                    </span>
                    <span className="text-xs bg-blue-50 text-[#0073E6] px-2.5 py-1 rounded-full font-medium">
                      Fáze {s.phase}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {s.phase === 1 && s.active && (
                    <button
                      onClick={() => handlePhase(s.id, 2)}
                      className="bg-orange-50 text-orange-600 border border-orange-200 px-4 py-2 rounded-xl text-xs font-medium hover:bg-orange-100 transition-colors"
                    >
                      Přepnout na Fázi 2
                    </button>
                  )}
                  {s.phase === 2 && s.active && (
                    <button
                      onClick={() => handlePhase(s.id, 1)}
                      className="bg-blue-50 text-[#0073E6] border border-blue-200 px-4 py-2 rounded-xl text-xs font-medium hover:bg-blue-100 transition-colors"
                    >
                      Zpět na Fázi 1
                    </button>
                  )}
                  <button
                    onClick={() => handleToggleActive(s.id, !s.active)}
                    className="bg-gray-50 text-gray-600 border border-gray-200 px-4 py-2 rounded-xl text-xs font-medium hover:bg-gray-100 transition-colors"
                  >
                    {s.active ? 'Deaktivovat' : 'Aktivovat'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}