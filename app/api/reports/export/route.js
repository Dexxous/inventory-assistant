import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role === 'USER') {
      return NextResponse.json({ error: 'Nedostatečná oprávnění' }, { status: 403 })
    }

    const activeSession = await prisma.inventorySession.findFirst({
      where: { active: true }
    })

    if (!activeSession) {
      return NextResponse.json({ error: 'Žádná aktivní inventura' }, { status: 404 })
    }

    const allDevices = await prisma.device.findMany()
    const records = await prisma.deviceRecord.findMany({
      where: { sessionId: activeSession.id },
      include: { device: true }
    })

    const foundSerials = new Set(records.filter(r => r.status === 'FOUND').map(r => r.device.serialNumber))
    const missingSerials = new Set(records.filter(r => r.status === 'MISSING').map(r => r.device.serialNumber))
    const newSerials = new Set(records.filter(r => r.status === 'NEW').map(r => r.device.serialNumber))

    const getStatus = (sn) => {
      if (foundSerials.has(sn)) return 'FOUND'
      if (missingSerials.has(sn)) return 'MISSING'
      if (newSerials.has(sn)) return 'NEW'
      return 'UNSCANNED'
    }

    const rows = [
      ['Sériové číslo', 'Název', 'Inv. číslo', 'Uživatel', 'Tým', 'Lokalita', 'Status'],
      ...allDevices.map(d => [
        d.serialNumber,
        d.name,
        d.inventoryNumber ?? '',
        d.assignedUser ?? '',
        d.team ?? '',
        d.location ?? '',
        getStatus(d.serialNumber)
      ])
    ]

    const csv = rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="report_${activeSession.name.replace(/\s+/g, '_')}.csv"`
      }
    })
  } catch (err) {
    console.error('Export error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}