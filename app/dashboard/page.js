import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import Navbar from '@/components/Navbar'
import SignOutButton from '@/components/SignOutButton'
import Image from 'next/image'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const deviceCount = await prisma.device.count()
  const foundCount = await prisma.deviceRecord.count({ where: { status: 'FOUND' } })
  const newCount = await prisma.deviceRecord.count({ where: { status: 'NEW' } })
  const activeSession = await prisma.inventorySession.findFirst({ where: { active: true } })

  return (
    <main className="min-h-screen bg-[#f4f5f7]">
      <nav className="bg-white border-b border-gray-200 px-6 py-0 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between h-14">
          <Image src="/atos-logo.svg" alt="Atos" width={72} height={24} />
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 hidden sm:block">{session.user.name}</span>
            <span className="text-[11px] font-semibold tracking-widest uppercase bg-gray-100 text-gray-500 px-2 py-1 rounded">
              {session.user.role}
            </span>
            <SignOutButton />
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-8">

        {/* Aktivní inventura banner */}
        {activeSession ? (
          <div className="bg-[#0073E6] rounded-xl p-5 mb-6 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-blue-200 mb-0.5">Aktivní inventura</p>
              <p className="text-white font-semibold">{activeSession.name}</p>
            </div>
            <span className="text-xs font-semibold bg-white/20 text-white px-3 py-1.5 rounded-lg">
              Fáze {activeSession.phase}
            </span>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <p className="text-sm font-medium text-amber-700">Žádná aktivní inventura</p>
            <p className="text-xs text-amber-500 mt-0.5">Admin musí nejdříve vytvořit inventuru.</p>
          </div>
        )}

        {/* Statistiky */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Celkem', value: deviceCount, color: 'text-gray-900' },
            { label: 'Nalezeno', value: foundCount, color: 'text-emerald-500' },
            { label: 'Nová', value: newCount, color: 'text-[#0073E6]' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-2">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Akce */}
        <div className="space-y-2 mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-3">Akce</p>

          {activeSession?.phase === 2 && (
            <a href="/phase2" className="flex items-center justify-between bg-orange-500 hover:bg-orange-600 text-white px-5 py-3.5 rounded-xl font-semibold text-sm transition-all">
              Kontrola inventury
              <span className="text-orange-200">→</span>
            </a>
          )}

          <a href="/scan" className="flex items-center justify-between bg-[#0073E6] hover:bg-[#005cc4] text-white px-5 py-3.5 rounded-xl font-semibold text-sm transition-all">
            Skenovat zařízení
            <span className="text-blue-300">→</span>
          </a>

          <a href="/devices" className="flex items-center justify-between bg-white hover:bg-gray-50 text-gray-800 px-5 py-3.5 rounded-xl font-medium text-sm border border-gray-200 transition-all">
            Seznam zařízení
            <span className="text-gray-300">→</span>
          </a>
        </div>
          
        {/* Admin sekce */}
        {session.user.role === 'ADMIN' && (
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-3">Administrace</p>
            {[
              { href: '/import', label: 'Import Excelu' },
              { href: '/sessions', label: 'Správa inventur' },
              { href: '/users', label: 'Správa uživatelů' },
            ].map(item => (
              <a key={item.href} href={item.href} className="flex items-center justify-between bg-white hover:bg-gray-50 text-gray-800 px-5 py-3.5 rounded-xl font-medium text-sm border border-gray-200 transition-all">
                {item.label}
                <span className="text-gray-300">→</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}