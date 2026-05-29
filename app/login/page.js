'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [isRegister, setIsRegister] = useState(false)
  
  // Login state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  
  // Register state
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('')
  const [regError, setRegError] = useState(null)
  const [regSuccess, setRegSuccess] = useState(false)
  const [regLoading, setRegLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    setError(null)
    const res = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)
    if (res.ok) router.push('/dashboard')
    else setError('Nesprávný email nebo heslo')
  }

  const handleRegister = async () => {
    setRegLoading(true)
    setRegError(null)
    setRegSuccess(false)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
          passwordConfirm: regPasswordConfirm
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setRegError(data.error || 'Chyba při registraci')
        return
      }

      setRegSuccess(true)
      setRegName('')
      setRegEmail('')
      setRegPassword('')
      setRegPasswordConfirm('')
      
      setTimeout(() => {
        setRegSuccess(false)
        setIsRegister(false)
      }, 2000)
    } catch (err) {
      setRegError('Chyba při kontaktu se serverem')
    } finally {
      setRegLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 relative">
      {/* Dekorativní pozadí */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-10 right-20 w-72 h-72 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="absolute bottom-32 -left-20 w-96 h-96 rounded-full bg-blue-600/5 blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Image src="/atos-logo.svg" alt="Atos" width={120} height={40} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventory Assistant</h1>
          <p className="text-gray-500 text-sm">Správa IT inventáře a zařízení</p>
        </div>

        {/* Přihlašovací formulář */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 p-8 shadow-lg">
          {!isRegister ? (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900">Přihlášení</h2>
                <p className="text-gray-500 text-sm mt-1">Přístup do systému</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-2.5 text-sm mb-5 flex items-start gap-3">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white focus:border-blue-500 transition-all"
                    placeholder="vas@email.cz"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Heslo</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white focus:border-blue-500 transition-all"
                    placeholder="••••••••"
                  />
                </div>
                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#0073E6] to-[#0064c4] hover:shadow-lg active:scale-95 text-white py-3 rounded-lg font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Přihlašování...' : 'Přihlásit se'}
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-center text-sm text-gray-600 mb-4">
                  Nemáte účet?{' '}
                  <button
                    onClick={() => setIsRegister(true)}
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Vytvořit účet
                  </button>
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900">Registrace</h2>
                <p className="text-gray-500 text-sm mt-1">Vytvořte si nový účet</p>
              </div>

              {regSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg px-4 py-3 text-sm mb-5 flex items-start gap-3">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                  Účet úspěšně vytvořen! Nyní se můžete přihlásit.
                </div>
              )}

              {regError && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-2.5 text-sm mb-5 flex items-start gap-3">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  {regError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Jméno</label>
                  <input
                    type="text"
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white focus:border-blue-500 transition-all"
                    placeholder="Vaše jméno"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Email</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white focus:border-blue-500 transition-all"
                    placeholder="vas@email.cz"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Heslo</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white focus:border-blue-500 transition-all"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Potvrzení hesla</label>
                  <input
                    type="password"
                    value={regPasswordConfirm}
                    onChange={e => setRegPasswordConfirm(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleRegister()}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white focus:border-blue-500 transition-all"
                    placeholder="••••••••"
                  />
                </div>
                <button
                  onClick={handleRegister}
                  disabled={regLoading}
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:shadow-lg active:scale-95 text-white py-3 rounded-lg font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {regLoading ? 'Vytváření...' : 'Vytvořit účet'}
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-center text-sm text-gray-600 mb-4">
                  Už máte účet?{' '}
                  <button
                    onClick={() => setIsRegister(false)}
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Přihlásit se
                  </button>
                </p>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-gray-400 text-xs mt-8">© 2024 Atos SE — Inventory Assistant</p>
      </div>
    </main>
  )
}
