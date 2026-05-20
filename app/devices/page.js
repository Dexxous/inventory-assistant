'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'

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
    (d.assignedUser ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (d.team ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main className="min-h-screen bg-[#f4f5f7]">
      <nav className="bg-white border-b border-gray-200 px-6 py-0 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between h-14">
          <Image src="/atos-logo.svg" alt="Atos" width={72} height={24} />
          <a href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">← Dashboard</a>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Zařízení</h1>
          <span className="text-xs text-gray-400 bg-white border border-gray-200 px-2.5 py-1 rounded-lg">{devices.length} celkem</span>
        </div>

        <input
          type="text"
          placeholder="Hledat podle názvu, SN, uživatele nebo týmu..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-[#0073E6]/30 focus:border-[#0073E6] transition-all"
        />

        {loading ? (
          <p className="text-center text-gray-400 py-12 text-sm">Načítám...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-400 py-12 text-sm">Žádná zařízení</p>
        ) : (
          <div className="space-y-2">
            {filtered.map(device => (
              <div key={device.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{device.name}</p>
                    <p className="text-xs font-mono text-gray-400 mt-0.5">{device.serialNumber}</p>
                  </div>
                  {device.inventoryNumber && (
                    <span className="text-xs text-gray-400 bg-gray-50 border border-gray-100 px-2 py-1 rounded shrink-0">
                      {device.inventoryNumber}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-3 mt-3">
                  {device.assignedUser && (
                    <span className="text-xs text-gray-500 bg-gray-50 border border-gray-100 px-2 py-1 rounded">
                      {device.assignedUser}
                    </span>
                  )}
                  {device.team && (
                    <span className="text-xs text-gray-500 bg-gray-50 border border-gray-100 px-2 py-1 rounded">
                      {device.team}
                    </span>
                  )}
                  {device.location && (
                    <span className="text-xs text-gray-500 bg-gray-50 border border-gray-100 px-2 py-1 rounded">
                      {device.location}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}