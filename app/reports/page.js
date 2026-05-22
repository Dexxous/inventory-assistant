'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { FileDown } from 'lucide-react'
import PDFExport from '@/components/PDFExport'

export default function ReportsPage() {
  const { data: session } = useSession()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    fetch('/api/reports')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
  }, [])

  const handleExport = async () => {
    setExporting(true)
    const res = await fetch('/api/reports/export')
    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `report_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    setExporting(false)
  }

  if (session?.user?.role === 'USER') {
    return (
      <main className="min-h-screen bg-[#f4f5f7] flex items-center justify-center">
        <p className="text-gray-500">Nemáte oprávnění k této stránce.</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f4f5f7]">
      <nav className="bg-white border-b border-gray-200 px-6 py-0 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Image src="/atos-logo.svg" alt="Atos" width={72} height={24} />
            <div className="border-l border-gray-300 h-6"></div>
            <span className="text-sm font-semibold text-gray-700">InventarizaceTool</span>
          </div>
          <a href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600">← Dashboard</a>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Reporty</h1>
          {data?.session && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleExport}
                disabled={exporting}
                className="flex items-center gap-2 text-sm bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50 font-medium"
              >
                <FileDown size={15} />
                {exporting ? 'Exportuji...' : 'Export CSV'}
              </button>
              <PDFExport data={data} />
            </div>
          )}
        </div>

        {loading ? (
          <p className="text-center text-gray-400 py-12 text-sm">Načítám...</p>
        ) : !data?.session ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
            <p className="text-amber-700 font-medium text-sm">Žádná aktivní inventura</p>
          </div>
        ) : (
          <>
            {/* Session info */}
            <div className="bg-[#0073E6] rounded-xl p-5 mb-6 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-blue-200 mb-0.5">Aktivní inventura</p>
                <p className="text-white font-semibold">{data.session.name}</p>
              </div>
              <span className="text-xs font-semibold bg-white/20 text-white px-3 py-1.5 rounded-lg">
                Fáze {data.session.phase}
              </span>
            </div>

            {/* Celkové statistiky */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Celkem zařízení</p>
                <p className="text-3xl font-bold text-gray-900">{data.summary.total}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Dokončeno</p>
                <p className="text-3xl font-bold text-gray-900">
                  {data.summary.total > 0 ? Math.round((data.summary.found / data.summary.total) * 100) : 0}%
                </p>
              </div>
              <div className="bg-white rounded-xl border border-emerald-200 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Nalezeno</p>
                <p className="text-3xl font-bold text-emerald-500">{data.summary.found}</p>
              </div>
              <div className="bg-white rounded-xl border border-red-200 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Chybí</p>
                <p className="text-3xl font-bold text-red-500">{data.summary.missing}</p>
              </div>
              <div className="bg-white rounded-xl border border-blue-200 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Nová</p>
                <p className="text-3xl font-bold text-[#0073E6]">{data.summary.new}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Nenaskenováno</p>
                <p className="text-3xl font-bold text-gray-400">{data.summary.unscanned}</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span>Průběh inventury</span>
                <span>{data.summary.found} / {data.summary.total}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div
                  className="bg-emerald-500 h-2.5 rounded-full transition-all"
                  style={{ width: `${data.summary.total > 0 ? (data.summary.found / data.summary.total) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Per tým */}
            {data.byTeam?.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
                <div className="px-5 py-4 border-b border-gray-100">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Per tým</p>
                </div>
                <div className="divide-y divide-gray-50">
                  {data.byTeam.map(team => (
                    <div key={team.team} className="px-5 py-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-gray-900 text-sm">{team.team || 'Bez týmu'}</p>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-emerald-500 font-semibold">{team.found} nalezeno</span>
                          {team.missing > 0 && <span className="text-red-400 font-semibold">{team.missing} chybí</span>}
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className="bg-emerald-500 h-1.5 rounded-full"
                          style={{ width: `${team.total > 0 ? (team.found / team.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Per uživatel */}
            {data.byUser?.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Per uživatel</p>
                </div>
                <div className="divide-y divide-gray-50">
                  {data.byUser.map(user => (
                    <div key={user.user} className="px-5 py-3 flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{user.user}</p>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-emerald-500 font-semibold">{user.found}</span>
                        <span className="text-gray-300">/</span>
                        <span className="text-gray-500">{user.total}</span>
                        {user.missing > 0 && (
                          <span className="bg-red-50 text-red-500 border border-red-100 px-2 py-0.5 rounded font-semibold">
                            {user.missing} chybí
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}