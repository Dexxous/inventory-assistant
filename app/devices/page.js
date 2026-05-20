'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export default function DevicesPage() {
  const { data: session } = useSession()
  const [devices, setDevices] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/devices')
      .then(r => r.json())
      .then(data => { setDevices(data.devices ?? []); setLoading(false) })
  }, [])

  const filtered = devices.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
    (d.assignedUser ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <a href="/dashboard" className="text-gray-400 hover:text-gray-600">← Zpět</a>
          <h1 className="text-xl font-semibold text-gray-800">Zařízení</h1>
          <span className="ml-auto text-sm text-gray-400">{devices.length} celkem</span>
        </div>

        <input
          type="text"
          placeholder="Hledat podle názvu, SN nebo uživatele..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {loading ? (
          <p className="text-center text-gray-400 py-12">Načítám...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-400 py-12">Žádná zařízení nenalezena</p>
        ) : (
          <div className="space-y-2">
            {filtered.map(device => (
              <div key={device.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-800">{device.name}</p>
                    <p className="text-xs font-mono text-gray-400 mt-0.5">{device.serialNumber}</p>
                  </div>
                  {device.inventoryNumber && (
                    <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                      {device.inventoryNumber}
                    </span>
                  )}
                </div>
                <div className="flex gap-4 mt-3 text-xs text-gray-500">
                  {device.assignedUser && <span>👤 {device.assignedUser}</span>}
                  {device.team && <span>🏢 {device.team}</span>}
                  {device.location && <span>📍 {device.location}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}