'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'

export default function Phase2Page() {
  const { data: session } = useSession()
  const [data, setData] = useState(null)
  const [activeSession, setActiveSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(null)

  useEffect(() => {
    fetch('/api/sessions')
      .then(r => r.json())
      .then(async d => {
        const active = (d.sessions ?? []).find(s => s.active)
        if (!active) { setLoading(false); return }
        setActiveSession(active)
        const res = await fetch(`/api/sessions/${active.id}/compare`)
        const compareData = await res.json()
        setData(compareData)
        setLoading(false)
      })
  }, [])

  const handleMarkMissing = async (deviceId) => {
    setMarking(deviceId)
    await fetch(`/api/sessions/${activeSession.id}/missing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId })
    })
    const res = await fetch(`/api/sessions/${activeSession.id}/compare`)
    const compareData = await res.json()
    setData(compareData)
    setMarking(null)
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      <nav className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/atos-logo.svg" alt="Atos" width={80} height={27} />
            <div className="border-l border-gray-300 h-6"></div>
            <span className="text-sm font-semibold text-gray-700">InventarizaceTool</span>
          </div>
          <a href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600 hover:underline transition-all duration-200">← Dashboard</a>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900">Fáze 2 — Kontrola</h1>
          {activeSession && (
            <span className="text-xs bg-orange-50 text-orange-600 border border-orange-200 px-2.5 py-1 rounded font-medium">
              {activeSession.name}
            </span>
          )}
        </div>

        {loading ? (
          <p className="text-center text-gray-400 py-12">Načítám...</p>
        ) : !activeSession ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
            <p className="text-amber-700 font-medium">Žádná aktivní inventura</p>
          </div>
        ) : activeSession.phase !== 2 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
            <p className="text-amber-700 font-medium">Inventura je stále ve Fázi 1</p>
            <p className="text-amber-500 text-sm mt-1">Admin musí přepnout na Fázi 2</p>
          </div>
        ) : (
          <>
            {/* Souhrnné statistiky */}
            {data?.summary && (
              <div className="grid grid-cols-4 gap-3 mb-6">
                <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
                  <p className="text-2xl font-bold text-gray-900">{data.summary.total}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Celkem</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
                  <p className="text-2xl font-bold text-emerald-500">{data.summary.found}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Nalezeno</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
                  <p className="text-2xl font-bold text-red-500">{data.summary.missing}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Chybí</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
                  <p className="text-2xl font-bold text-[#0073E6]">{data.summary.extra}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Nová</p>
                </div>
              </div>
            )}

            {/* Chybějící zařízení */}
            {data?.missing?.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-red-400 mb-3">
                  Nenalezená zařízení ({data.missing.length})
                </p>
                <div className="space-y-2">
                  {data.missing.map(device => (
                    <div key={device.id} className="bg-white rounded-xl border border-red-100 p-4 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{device.name}</p>
                        <p className="text-xs font-mono text-gray-400 mt-0.5">{device.serialNumber}</p>
                        <div className="flex gap-3 mt-1">
                          {device.assignedUser && <p className="text-xs text-gray-400">{device.assignedUser}</p>}
                          {device.location && <p className="text-xs text-gray-400">{device.location}</p>}
                        </div>
                      </div>
                      <button
                        onClick={() => handleMarkMissing(device.id)}
                        disabled={marking === device.id}
                        className="shrink-0 bg-red-50 text-red-500 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        {marking === device.id ? '...' : 'Označit jako chybí'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nalezená zařízení */}
            {data?.found?.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-emerald-500 mb-3">
                  Nalezená zařízení ({data.found.length})
                </p>
                <div className="space-y-2">
                  {data.found.map(device => (
                    <div key={device.id} className="bg-white rounded-xl border border-emerald-100 p-4">
                      <p className="font-medium text-gray-900">{device.name}</p>
                      <p className="text-xs font-mono text-gray-400 mt-0.5">{device.serialNumber}</p>
                      <div className="flex gap-3 mt-1">
                        {device.assignedUser && <p className="text-xs text-gray-400">{device.assignedUser}</p>}
                        {device.team && <p className="text-xs text-gray-400">{device.team}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nová zařízení mimo evidenci */}
            {data?.extra?.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#0073E6] mb-3">
                  Nová zařízení mimo evidenci ({data.extra.length})
                </p>
                <div className="space-y-2">
                  {data.extra.map(device => (
                    <div key={device.id} className="bg-white rounded-xl border border-blue-100 p-4">
                      <p className="font-medium text-gray-900">{device.name}</p>
                      <p className="text-xs font-mono text-gray-400 mt-0.5">{device.serialNumber}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data?.missing?.length === 0 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
                <p className="text-emerald-700 font-semibold text-lg">Vše nalezeno</p>
                <p className="text-emerald-500 text-sm mt-1">Všechna zařízení byla úspěšně inventarizována.</p>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}