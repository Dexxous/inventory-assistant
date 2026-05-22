'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    setError(null)
    const res = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)
    if (res.ok) router.push('/dashboard')
    else setError('Nesprávný email nebo heslo')
  }

  return (
    <main className="min-h-screen flex">
      {/* Levý panel */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 bg-[#0073E6] p-10 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/5" />
          <div className="absolute top-40 -right-10 w-60 h-60 rounded-full bg-white/5" />
          <div className="absolute -bottom-10 left-10 w-96 h-96 rounded-full bg-white/5" />
        </div>
        <Image src="/atos-logo.svg" alt="Atos" width={100} height={34} className="brightness-0 invert relative z-10" />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white leading-snug mb-3">
            Inventory<br />Assistant
          </h1>
          <p className="text-blue-100 text-sm leading-relaxed">
            Systém pro správu a inventarizaci IT zařízení. Skenování, evidence, reporty.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4 border-t border-white/20 pt-8">
            <div>
              <p className="text-xl font-bold text-white">QR</p>
              <p className="text-blue-200 text-xs mt-0.5">Skenování</p>
            </div>
            <div>
              <p className="text-xl font-bold text-white">Live</p>
              <p className="text-blue-200 text-xs mt-0.5">Přehledy</p>
            </div>
            <div>
              <p className="text-xl font-bold text-white">Role</p>
              <p className="text-blue-200 text-xs mt-0.5">Oprávnění</p>
            </div>
          </div>
        </div>
        <p className="text-blue-300 text-xs relative z-10">© 2024 Atos SE — Interní nástroj</p>
      </div>

      {/* Pravý panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#f4f5f7]">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <div className="flex items-center gap-3">
              <Image src="/atos-logo.svg" alt="Atos" width={90} height={30} />
              <div className="border-l border-gray-300 h-8"></div>
              <span className="text-sm font-semibold text-gray-700">InventarizaceTool</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Přihlášení</h2>
            <p className="text-sm text-gray-400 mb-6">Zadejte své přihlašovací údaje</p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-2.5 text-sm mb-5">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073E6]/30 focus:border-[#0073E6] transition-all"
                  placeholder="vas@email.cz"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Heslo</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073E6]/30 focus:border-[#0073E6] transition-all"
                  placeholder="••••••••"
                />
              </div>
              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-[#0073E6] hover:bg-[#005cc4] text-white py-2.5 rounded-lg font-semibold text-sm transition-all disabled:opacity-50"
              >
                {loading ? 'Přihlašování...' : 'Přihlásit se'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}