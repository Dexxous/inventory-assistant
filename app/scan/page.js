'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'

const Scanner = dynamic(() => import('@/components/Scanner'), { ssr: false })

export default function ScanPage() {
  const { data: session } = useSession()
  const [sessions, setSessions] = useState([])
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
        setSessions(data.sessions ?? [])
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
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-sm w-full text-center">
          <p className="text-gray-500 text-sm mb-2">Žádná aktivní inventura</p>
          <p className="text-gray-400 text-xs">Admin musí nejdříve vytvořit inventuru</p>
          <a href="/dashboard" className="block mt-4 text-blue-600 text-sm">← Zpět na dashboard</a>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-sm mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <a href="/dashboard" className="text-gray-400 hover:text-gray-600">← Zpět</a>
          <div>
            <h1 className="text-lg font-semibold text-gray-800">Skenování</h1>
            <p className="text-xs text-gray-400">{activeSession.name} · Fáze {activeSession.phase}</p>
          </div>
        </div>

        {result?.status === 'FOUND' && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-4">
            <p className="text-green-700 font-semibold text-lg">✓ Nalezeno</p>
            <p className="text-green-800 font-medium mt-1">{result.device.name}</p>
            <p className="text-green-600 text-xs font-mono mt-0.5">{result.device.serialNumber}</p>
            {result.device.assignedUser && <p className="text-green-600 text-sm mt-2">👤 {result.device.assignedUser}</p>}
            {result.device.team && <p className="text-green-600 text-sm">🏢 {result.device.team}</p>}
          </div>
        )}

        {result?.status === 'SAVED' && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-4">
            <p className="text-blue-700 font-semibold text-lg">✓ Nové zařízení uloženo</p>
            <p className="text-blue-600 text-sm mt-1">Zařízení bylo přidáno do evidence.</p>
          </div>
        )}

        {result?.status === 'NEW' && newDevice && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-4">
            <p className="text-orange-700 font-semibold">➕ Nové zařízení</p>
            <p className="text-orange-600 text-xs font-mono mt-1">{newDevice.serialNumber}</p>
            <div className="mt-3 space-y-2">
              <input
                placeholder="Název zařízení"
                value={newForm.name}
                onChange={e => setNewForm({ ...newForm, name: e.target.value })}
                className="w-full border border-orange-200 rounded-lg px-3 py-2 text-sm bg-white"
              />
              <input
                placeholder="Tým"
                value={newForm.team}
                onChange={e => setNewForm({ ...newForm, team: e.target.value })}
                className="w-full border border-orange-200 rounded-lg px-3 py-2 text-sm bg-white"
              />
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleSaveNew}
                disabled={saving}
                className="flex-1 bg-orange-500 text-white py-2 rounded-xl text-sm font-medium disabled:opacity-50"
              >
                {saving ? 'Ukládám...' : 'Uložit'}
              </button>
              <button
                onClick={() => { setNewDevice(null); setResult(null) }}
                className="flex-1 bg-white border border-orange-200 text-orange-600 py-2 rounded-xl text-sm"
              >
                Přeskočit
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-3">
          {scanning ? (
            <div>
              <Scanner onScan={handleScan} />
              <button
                onClick={() => setScanning(false)}
                className="w-full mt-3 py-2 text-gray-400 text-sm"
              >
                Zrušit
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setScanning(true); setResult(null) }}
              className="w-full bg-blue-600 text-white py-4 rounded-xl text-lg font-medium"
            >
              📷 Spustit skener
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-xs text-gray-400 mb-2">Nebo zadej ručně:</p>
          <div className="flex gap-2">
            <input
              placeholder="Sériové číslo..."
              value={manualSN}
              onChange={e => setManualSN(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleManual()}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleManual}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}