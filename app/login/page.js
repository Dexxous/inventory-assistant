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
    else setError('Špatný email nebo heslo')
  }

  return (
    <main className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #f0f6ff 0%, #e8f0fe 50%, #f5f0ff 100%)' }}>
      {/* Levý panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-[#0073E6] p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full border-2 border-white" />
          <div className="absolute top-40 left-32 w-40 h-40 rounded-full border border-white" />
          <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full border-2 border-white" />
          <div className="absolute bottom-40 right-20 w-48 h-48 rounded-full border border-white" />
        </div>
        <Image src="/atos-logo.svg" alt="Atos" width={120} height={40} className="brightness-0 invert" />
        <div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Inventory<br />Assistant
          </h1>
          <p className="text-blue-100 text-lg leading-relaxed">
            Digitální inventarizace IT zařízení.<br />
          </p>
          <div className="mt-8 flex gap-6">
            <div>
              <p className="text-3xl font-bold text-white">100%</p>
              <p className="text-blue-200 text-sm">mobilní přístup</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">QR</p>
              <p className="text-blue-200 text-sm">skenování</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">live</p>
              <p className="text-blue-200 text-sm">přehledy</p>
            </div>
          </div>
        </div>
        <p className="text-blue-200 text-sm">© 2024 Atos SE. Interní nástroj.</p>
      </div>

      {/* Pravý panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <Image src="/atos-logo.svg" alt="Atos" width={100} height={34} />
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Přihlášení</h2>
            <p className="text-gray-500 text-sm mt-1">Zadejte své přihlašovací údaje</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-6 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073E6] focus:border-transparent transition-all"
                placeholder="vas@email.cz"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Heslo</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0073E6] focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-[#0073E6] hover:bg-[#0062c4] text-white py-3.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 mt-2 shadow-lg shadow-blue-200"
            >
              {loading ? 'Přihlašování...' : 'Přihlásit se →'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}