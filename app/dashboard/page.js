import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import Image from 'next/image'
import SignOutButton from '@/components/SignOutButton'
import {
  QrCode,
  ClipboardList,
  Monitor,
  BarChart2,
  FileSpreadsheet,
  CalendarCheck,
  Users,
  ChevronRight
} from 'lucide-react'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const deviceCount = await prisma.device.count()
  const foundCount = await prisma.deviceRecord.count({ where: { status: 'FOUND' } })
  const newCount = await prisma.deviceRecord.count({ where: { status: 'NEW' } })
  const activeSession = await prisma.inventorySession.findFirst({ where: { active: true } })

  return (
    <main className="min-h-screen bg-[#f4f5f7]">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between h-12">
          <div className="flex items-center gap-3">
            <Image src="/atos-logo.svg" alt="Atos" width={64} height={22} />
            <div className="border-l border-gray-300 h-5"></div>
            <span className="text-sm font-semibold text-gray-700">InventarizaceTool</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold tracking-widest uppercase bg-gray-100 text-gray-500 px-2 py-1 rounded">
              {session.user.role}
            </span>
            <SignOutButton />
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-5">

        {/* Aktivní inventura banner */}
        {activeSession ? (
          <div className="bg-[#0073E6] rounded-xl px-4 py-4 mb-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-200 mb-0.5">Aktivní inventura</p>
              <p className="text-white font-semibold text-sm">{activeSession.name}</p>
            </div>
            <span className="text-xs font-semibold bg-white/20 text-white px-3 py-1.5 rounded-lg shrink-0 ml-3">
              Fáze {activeSession.phase}
            </span>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5">
            <p className="text-sm font-medium text-amber-700">Žádná aktivní inventura</p>
            <p className="text-xs text-amber-500 mt-0.5">Admin musí nejdříve vytvořit inventuru.</p>
          </div>
        )}

        {/* Statistiky */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {[
            { label: 'Celkem', value: deviceCount, color: 'text-gray-900' },
            { label: 'Nalezeno', value: foundCount, color: 'text-emerald-500' },
            { label: 'Nová', value: newCount, color: 'text-[#0073E6]' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 px-3 py-4 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">{stat.label}</p>
              <p className={`text-4xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Dominantní tlačítka */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {activeSession?.phase === 2 ? (
            <>
              <a href="/phase2" className="flex flex-col justify-between bg-orange-500 active:bg-orange-600 text-white px-4 py-5 rounded-xl transition-all min-h-[110px]">
                <ClipboardList size={22} className="text-orange-200" />
                <span className="text-base font-bold leading-tight mt-2">Kontrola inventury</span>
              </a>
              <a href="/scan" className="flex flex-col justify-between bg-[#0073E6] active:bg-[#005cc4] text-white px-4 py-5 rounded-xl transition-all min-h-[110px]">
                <QrCode size={22} className="text-blue-200" />
                <span className="text-base font-bold leading-tight mt-2">Skenovat zařízení</span>
              </a>
            </>
          ) : (
            <a href="/scan" className="col-span-2 flex items-center justify-between bg-[#0073E6] active:bg-[#005cc4] text-white px-5 py-6 rounded-xl transition-all">
              <div className="flex items-center gap-4">
                <QrCode size={28} className="text-blue-200 shrink-0" />
                <span className="text-xl font-bold">Skenovat zařízení</span>
              </div>
              <ChevronRight size={20} className="text-blue-300" />
            </a>
          )}
        </div>

        {/* Sekundární akce */}
        <div className="space-y-2 mb-5">
          <a href="/devices" className="flex items-center justify-between bg-white active:bg-gray-50 text-gray-700 px-4 py-4 rounded-xl font-medium text-sm border border-gray-200 transition-all">
            <div className="flex items-center gap-3">
              <Monitor size={18} className="text-gray-400 shrink-0" />
              Seznam zařízení
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </a>
          {(session.user.role === 'ADMIN' || session.user.role === 'MANAGER') && (
            <a href="/reports" className="flex items-center justify-between bg-white active:bg-gray-50 text-gray-700 px-4 py-4 rounded-xl font-medium text-sm border border-gray-200 transition-all">
              <div className="flex items-center gap-3">
                <BarChart2 size={18} className="text-gray-400 shrink-0" />
                Reporty
              </div>
              <ChevronRight size={16} className="text-gray-300" />
            </a>
          )}
        </div>

        {/* Admin sekce */}
        {session.user.role === 'ADMIN' && (
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 px-1 mb-2">Administrace</p>
            {[
              { href: '/import', label: 'Import Excelu', icon: <FileSpreadsheet size={18} className="text-gray-400 shrink-0" /> },
              { href: '/sessions', label: 'Správa inventur', icon: <CalendarCheck size={18} className="text-gray-400 shrink-0" /> },
              { href: '/users', label: 'Správa uživatelů', icon: <Users size={18} className="text-gray-400 shrink-0" /> },
            ].map(item => (
              <a key={item.href} href={item.href} className="flex items-center justify-between bg-white active:bg-gray-50 text-gray-700 px-4 py-4 rounded-xl font-medium text-sm border border-gray-200 transition-all">
                <div className="flex items-center gap-3">
                  {item.icon}
                  {item.label}
                </div>
                <ChevronRight size={16} className="text-gray-300" />
              </a>
            ))}
          </div>
        )}

        <div className="h-6" />
      </div>
    </main>
  )
}