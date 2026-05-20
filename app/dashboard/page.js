import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { signOut } from 'next-auth/react'
import prisma from '@/lib/prisma'
import Image from 'next/image'
import SignOutButton from '@/components/SignOutButton'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const deviceCount = await prisma.device.count()
  const foundCount = await prisma.deviceRecord.count({ where: { status: 'FOUND' } })
  const newCount = await prisma.deviceRecord.count({ where: { status: 'NEW' } })
  const activeSession = await prisma.inventorySession.findFirst({ where: { active: true } })

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Image src="/atos-logo.svg" alt="Atos" width={80} height={27} />
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 hidden sm:block">{session.user.name}</span>
            <span className="text-xs bg-blue-50 text-[#0073E6] px-2.5 py-1 rounded-full font-medium">
              {session.user.role}
            </span>
            <SignOutButton />
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="mt-4 mb-6">
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          {activeSession && (
            <p className="text-sm text-gray-500 mt-0.5">
              Aktivní inventura: <span className="font-medium text-[#0073E6]">{activeSession.name}</span>
              <span className="ml-2 bg-blue-50 text-[#0073E6] text-xs px-2 py-0.5 rounded-full">Fáze {activeSession.phase}</span>
            </p>
          )}
        </div>

        {/* Statistiky */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Celkem</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{deviceCount}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Nalezeno</p>
            <p className="text-3xl font-bold text-emerald-500 mt-1">{foundCount}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Nová</p>
            <p className="text-3xl font-bold text-[#0073E6] mt-1">{newCount}</p>
          </div>
        </div>

        {/* Akce */}
        <div className="space-y-3">
          <a href="/scan" className="flex items-center justify-between bg-[#0073E6] hover:bg-[#0062c4] text-white px-5 py-4 rounded-2xl font-semibold transition-all shadow-lg shadow-blue-200">
            <span>📷 Skenovat zařízení</span>
            <span className="text-blue-200">→</span>
          </a>
          <a href="/devices" className="flex items-center justify-between bg-white hover:bg-gray-50 text-gray-700 px-5 py-4 rounded-2xl font-medium border border-gray-100 shadow-sm transition-all">
            <span>🖥 Seznam zařízení</span>
            <span className="text-gray-300">→</span>
          </a>
          {session.user.role === 'ADMIN' && (
            <>
              <a href="/import" className="flex items-center justify-between bg-white hover:bg-gray-50 text-gray-700 px-5 py-4 rounded-2xl font-medium border border-gray-100 shadow-sm transition-all">
                <span>📂 Importovat Excel</span>
                <span className="text-gray-300">→</span>
              </a>
              <a href="/sessions" className="flex items-center justify-between bg-white hover:bg-gray-50 text-gray-700 px-5 py-4 rounded-2xl font-medium border border-gray-100 shadow-sm transition-all">
                <span>📋 Správa inventur</span>
                <span className="text-gray-300">→</span>
              </a>
            </>
          )}
        </div>
      </div>
    </main>
  )
}