'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function ImportPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER')) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Nemáte oprávnění k této stránce.</p>
      </main>
    )
  }

  const handleFile = async (e) => {
    const selected = e.target.files[0]
    if (!selected) return
    setFile(selected)
    setResult(null)
    setError(null)

    const formData = new FormData()
    formData.append('file', selected)

    const res = await fetch('/api/import/preview', {
      method: 'POST',
      body: formData
    })
    const data = await res.json()
    if (data.rows) setPreview(data.rows)
  }

  const handleImport = async () => {
    if (!file) return
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/import', {
      method: 'POST',
      body: formData
    })
    const data = await res.json()
    setLoading(false)

    if (data.success) {
      setResult(data)
    } else {
      setError(data.error ?? 'Import selhal')
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <a href="/dashboard" className="text-gray-400 hover:text-gray-600">← Zpět</a>
          <h1 className="text-xl font-semibold text-gray-800">Import zařízení</h1>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
          <label className="block w-full border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-blue-300 transition-colors">
            <p className="text-gray-500 text-sm mb-1">Přetáhni Excel nebo klikni pro výběr</p>
            <p className="text-gray-400 text-xs">Podporované formáty: .xlsx, .xls</p>
            {file && <p className="text-blue-600 text-sm mt-2 font-medium">{file.name}</p>}
            <input type="file" accept=".xlsx,.xls" onChange={handleFile} className="hidden" />
          </label>
        </div>

        {preview && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Náhled (první 3 řádky):
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 pr-4 text-gray-500 font-medium">Inv. číslo</th>
                    <th className="text-left py-2 pr-4 text-gray-500 font-medium">Název</th>
                    <th className="text-left py-2 pr-4 text-gray-500 font-medium">Sériové č.</th>
                    <th className="text-left py-2 pr-4 text-gray-500 font-medium">Uživatel</th>
                    <th className="text-left py-2 text-gray-500 font-medium">Tým</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="py-2 pr-4 text-gray-600">{row.inventoryNumber ?? '—'}</td>
                      <td className="py-2 pr-4 text-gray-800 font-medium">{row.name}</td>
                      <td className="py-2 pr-4 text-gray-600 font-mono">{row.serialNumber}</td>
                      <td className="py-2 pr-4 text-gray-600">{row.assignedUser ?? '—'}</td>
                      <td className="py-2 text-gray-600">{row.team ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">
            {error}
          </div>
        )}

        {result && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm mb-4">
            ✓ Importováno {result.count} zařízení
          </div>
        )}

        {preview && !result && (
          <button
            onClick={handleImport}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-medium disabled:opacity-50"
          >
            {loading ? 'Importuji...' : `Importovat zařízení`}
          </button>
        )}
      </div>
    </main>
  )
}