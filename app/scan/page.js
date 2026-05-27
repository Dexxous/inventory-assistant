'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import OCRScanner from '@/components/OCRScanner'

const Scanner = dynamic(() => import('@/components/Scanner'), { ssr: false })

export default function ScanPage() {
  const { data: session } = useSession()
  const [activeSession, setActiveSession] = useState(null)
  const [result, setResult] = useState(null)
  const [manualSN, setManualSN] = useState('')
  const [scanning, setScanning] = useState(false)
  const [newDevice, setNewDevice] = useState(null)
  const [newForm, setNewForm] = useState({ name: '', team: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/sessions')
      .then(r => r.json())
      .then(data => {
        const active = (data.sessions ?? []).find(s => s.active)
        if (active) setActiveSession(active)
      })
  }, [])

  const handleScan = async (serialNumber) => {
    setScanning(false)
    setResult(null)
    setNewDevice(null)
    if (!activeSession) return

    const res = await fetch(`/api/sessions/${activeSession.id}/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serialNumber })
    })
    const data = await res.json()
    setResult(data)
    if (data.status === 'NEW') {
      setNewDevice({ serialNumber })
      setNewForm({ name: '', team: '' })
    }
  }

  const handleManual = () => {
    if (!manualSN.trim()) return
    handleScan(manualSN.trim())
    setManualSN('')
  }

  const handleSaveNew = async () => {
    setSaving(true)
    await fetch(`/api/devices/${newDevice.serialNumber}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serialNumber: newDevice.serialNumber,
        name: newForm.name || 'Neznámé zařízení',
        team: newForm.team,
        sessionId: activeSession.id
      })
    })
    setSaving(false)
    setNewDevice(null)
    setResult({ status: 'SAVED' })
  }

  if (!activeSession) {
    return (
      <main className="min-h-screen bg-[#f4f5f7]">
        <nav className="bg-white border-b border-gray-200 px-6 py-0">
          <div className="max-w-2xl mx-auto flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <Image src="/atos-logo.svg" alt="Atos" width={72} height={24} />
              <div className="border-l border-gray-300 h-6"></div>
              <span className="text-sm font-semibold text-gray-700">InventarizaceTool</span>
            </div>
            <a href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600 hover:underline transition-all duration-200">← Dashboard</a>
          </div>
        </nav>
        <div className="max-w-sm mx-auto px-6 py-16 text-center">
          <p className="text-gray-500 font-medium">Žádná aktivní inventura</p>
          <p className="text-gray-400 text-sm mt-1">Admin musí nejdříve vytvořit inventuru</p>
          <a href="/dashboard" className="inline-block mt-4 text-[#0073E6] text-sm">← Zpět na dashboard</a>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f4f5f7]">
      <nav className="bg-white border-b border-gray-200 px-6 py-0 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between h-14">
          <Image src="/atos-logo.svg" alt="Atos" width={72} height={24} />
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">{activeSession.name}</span>
            <span className="text-[11px] font-semibold bg-gray-100 text-gray-500 px-2 py-1 rounded uppercase tracking-wide">Fáze {activeSession.phase}</span>
            <a href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600">← Zpět</a>
          </div>
        </div>
      </nav>

      <div className="max-w-sm mx-auto px-6 py-8 space-y-3">

        {/* Výsledek — FOUND */}
        {result?.status === 'FOUND' && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <p className="text-emerald-700 font-semibold text-sm uppercase tracking-wide">Nalezeno</p>
            </div>
            <p className="font-semibold text-gray-900">{result.device.name}</p>
            <p className="text-xs font-mono text-gray-400 mt-0.5">{result.device.serialNumber}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {result.device.assignedUser && (
                <span className="text-xs bg-white border border-emerald-200 text-gray-600 px-2 py-1 rounded">{result.device.assignedUser}</span>
              )}
              {result.device.team && (
                <span className="text-xs bg-white border border-emerald-200 text-gray-600 px-2 py-1 rounded">{result.device.team}</span>
              )}
              {result.device.location && (
                <span className="text-xs bg-white border border-emerald-200 text-gray-600 px-2 py-1 rounded">{result.device.location}</span>
              )}
            </div>
          </div>
        )}

        {/* Výsledek — SAVED */}
        {result?.status === 'SAVED' && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-[#0073E6]" />
              <p className="text-[#0073E6] font-semibold text-sm uppercase tracking-wide">Uloženo</p>
            </div>
            <p className="text-sm text-gray-600">Nové zařízení bylo přidáno do evidence.</p>
          </div>
        )}

        {/* Výsledek — NEW */}
        {result?.status === 'NEW' && newDevice && (
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-orange-400" />
              <p className="text-orange-600 font-semibold text-sm uppercase tracking-wide">Nové zařízení</p>
            </div>
            <p className="text-xs font-mono text-gray-400 mb-4">{newDevice.serialNumber}</p>
            <div className="space-y-2 mb-4">
              <input
                placeholder="Název zařízení"
                value={newForm.name}
                onChange={e => setNewForm({ ...newForm, name: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073E6]/30 focus:border-[#0073E6]"
              />
              <input
                placeholder="Tým"
                value={newForm.team}
                onChange={e => setNewForm({ ...newForm, team: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073E6]/30 focus:border-[#0073E6]"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveNew}
                disabled={saving}
                className="flex-1 bg-[#0073E6] hover:bg-[#0064c4] hover:scale-105 hover:shadow-lg active:bg-[#005cc4] text-white py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none disabled:hover:bg-[#0073E6]"
              >
                {saving ? 'Ukládám...' : 'Uložit zařízení'}
              </button>
              <button
                onClick={() => { setNewDevice(null); setResult(null) }}
                className="px-4 py-2.5 rounded-lg text-sm text-gray-500 border border-gray-200 hover:bg-gray-100 hover:scale-105 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 active:bg-gray-200"
              >
                Přeskočit
              </button>
            </div>
          </div>
        )}

        {/* Skener */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          {scanning ? (
            <div>
              <Scanner onScan={handleScan} />
              <button
                onClick={() => setScanning(false)}
                className="w-full mt-3 py-2 text-sm text-gray-400 hover:text-gray-600"
              >
                Zrušit skenování
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setScanning(true); setResult(null) }}
              className="w-full bg-[#0073E6] hover:bg-[#0064c4] hover:scale-105 hover:shadow-lg active:bg-[#005cc4] text-white py-4 rounded-lg font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5"
            >
              Spustit skener
            </button>
          )}
        </div>

        {/* OCR sekce */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Focení štítku</p>
          <OCRScanner onResult={(sn) => handleScan(sn)} />
        </div>

        {/* Ruční zadání */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Ruční zadání</p>
          <div className="flex gap-2">
            <input
              placeholder="Sériové číslo..."
              value={manualSN}
              onChange={e => setManualSN(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleManual()}
              className="flex-1 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073E6]/30 focus:border-[#0073E6] transition-all"
            />
            <button
              onClick={handleManual}
              className="bg-gray-900 hover:bg-gray-700 hover:scale-105 hover:shadow-lg active:bg-gray-800 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5"
            >
              Potvrdit
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}