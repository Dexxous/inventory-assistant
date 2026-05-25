'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { SlidersHorizontal, X } from 'lucide-react'

export default function DevicesPage() {
  const [devices, setDevices] = useState([])
  const [search, setSearch] = useState('')
  const [filterTeam, setFilterTeam] = useState('')
  const [filterLocation, setFilterLocation] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetch('/api/devices')
      .then(r => r.json())
      .then(data => { setDevices(data.devices ?? []); setLoading(false) })
  }, [])

  const teams = [...new Set(devices.map(d => d.team).filter(Boolean))].sort()
  const locations = [...new Set(devices.map(d => d.location).filter(Boolean))].sort()

  const activeFilters = [filterTeam, filterLocation].filter(Boolean).length

  const filtered = devices
    .filter(d =>
      (d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
      (d.assignedUser ?? '').toLowerCase().includes(search.toLowerCase())) &&
      (filterTeam ? d.team === filterTeam : true) &&
      (filterLocation ? d.location === filterLocation : true)
    )
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'serial') return a.serialNumber.localeCompare(b.serialNumber)
      if (sortBy === 'team') return (a.team ?? '').localeCompare(b.team ?? '')
      if (sortBy === 'user') return (a.assignedUser ?? '').localeCompare(b.assignedUser ?? '')
      return 0
    })

  const clearFilters = () => {
    setFilterTeam('')
    setFilterLocation('')
    setSearch('')
    setSortBy('name')
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
          <h1 className="text-xl font-semibold text-gray-900">Zařízení</h1>
          <span className="text-xs text-gray-400 bg-white border border-gray-200 px-2.5 py-1 rounded-lg">
            {filtered.length} / {devices.length}
          </span>
        </div>

        {/* Hledání + filtr tlačítko */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="Hledat podle názvu, SN nebo uživatele..."
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
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5">Lokalita</label>
                <select
                  value={filterLocation}
                  onChange={e => setFilterLocation(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073E6]/30 bg-white"
                >
                  <option value="">Všechny lokality</option>
                  {locations.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5">Seřadit podle</label>
              <div className="flex gap-2">
                {[
                  { value: 'name', label: 'Název' },
                  { value: 'serial', label: 'SN' },
                  { value: 'team', label: 'Tým' },
                  { value: 'user', label: 'Uživatel' },
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
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 font-medium"
              >
                <X size={12} />
                Zrušit filtry
              </button>
            )}
          </div>
        )}

        {/* Aktivní filtry — tagy */}
        {(filterTeam || filterLocation) && (
          <div className="flex gap-2 mb-3 flex-wrap">
            {filterTeam && (
              <span className="flex items-center gap-1.5 text-xs bg-blue-50 text-[#0073E6] border border-blue-200 px-2.5 py-1 rounded-full font-medium">
                {filterTeam}
                <button onClick={() => setFilterTeam('')}><X size={10} /></button>
              </span>
            )}
            {filterLocation && (
              <span className="flex items-center gap-1.5 text-xs bg-blue-50 text-[#0073E6] border border-blue-200 px-2.5 py-1 rounded-full font-medium">
                {filterLocation}
                <button onClick={() => setFilterLocation('')}><X size={10} /></button>
              </span>
            )}
          </div>
        )}

        {/* Seznam */}
        {loading ? (
          <p className="text-center text-gray-400 py-12 text-sm">Načítám...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">Žádná zařízení</p>
            {activeFilters > 0 && (
              <button onClick={clearFilters} className="text-[#0073E6] text-sm mt-2">Zrušit filtry</button>
            )}
          </div>
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
                <div className="flex flex-wrap gap-2 mt-3">
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
        <div className="h-6" />
      </div>
    </main>
  )
}