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
      return NextResponse.json({ session: null })
    }

    const allDevices = await prisma.device.findMany()
    const records = await prisma.deviceRecord.findMany({
      where: { sessionId: activeSession.id },
      include: { device: true, scannedBy: true }
    })

    const foundRecords = records.filter(r => r.status === 'FOUND')
    const missingRecords = records.filter(r => r.status === 'MISSING')
    const newRecords = records.filter(r => r.status === 'NEW')

    const foundSerials = new Set(foundRecords.map(r => r.device.serialNumber))
    const missingSerials = new Set(missingRecords.map(r => r.device.serialNumber))

    const unscanned = allDevices.filter(d =>
      !foundSerials.has(d.serialNumber) && !missingSerials.has(d.serialNumber)
    ).length

    // Per tým
    const teamMap = {}
    allDevices.forEach(d => {
      const team = d.team || 'Bez týmu'
      if (!teamMap[team]) teamMap[team] = { team, total: 0, found: 0, missing: 0 }
      teamMap[team].total++
      if (foundSerials.has(d.serialNumber)) teamMap[team].found++
      if (missingSerials.has(d.serialNumber)) teamMap[team].missing++
    })

    // Per uživatel
    const userMap = {}
    allDevices.forEach(d => {
      const user = d.assignedUser || 'Nepřiřazeno'
      if (!userMap[user]) userMap[user] = { user, total: 0, found: 0, missing: 0 }
      userMap[user].total++
      if (foundSerials.has(d.serialNumber)) userMap[user].found++
      if (missingSerials.has(d.serialNumber)) userMap[user].missing++
    })

    return NextResponse.json({
      session: activeSession,
      summary: {
        total: allDevices.length,
        found: foundRecords.length,
        missing: missingRecords.length,
        new: newRecords.length,
        unscanned
      },
      byTeam: Object.values(teamMap).sort((a, b) => b.total - a.total),
      byUser: Object.values(userMap).sort((a, b) => b.total - a.total)
    })
  } catch (err) {
    console.error('Reports error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}