import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Nepřihlášen' }, { status: 401 })

    const { id } = await params
    const sessionId = parseInt(id)

    const allDevices = await prisma.device.findMany()

    const foundRecords = await prisma.deviceRecord.findMany({
      where: { sessionId, status: 'FOUND' },
      include: { device: true }
    })

    const newRecords = await prisma.deviceRecord.findMany({
      where: { sessionId, status: 'NEW' },
      include: { device: true }
    })

    const foundSerials = new Set(foundRecords.map(r => r.device.serialNumber))
    const newSerials = new Set(newRecords.map(r => r.device.serialNumber))

    const found = allDevices.filter(d => foundSerials.has(d.serialNumber))
    const missing = allDevices.filter(d => !foundSerials.has(d.serialNumber) && !newSerials.has(d.serialNumber))
    const extra = newRecords.map(r => r.device)

    // Filtrování podle role
    let filteredMissing = missing
    let filteredFound = found
    if (session.user.role === 'USER') {
      filteredMissing = missing.filter(d => d.assignedUser === session.user.name)
      filteredFound = found.filter(d => d.assignedUser === session.user.name)
    } else if (session.user.role === 'MANAGER') {
      filteredMissing = missing.filter(d => d.team === session.user.team)
      filteredFound = found.filter(d => d.team === session.user.team)
    }

    return NextResponse.json({
      found: filteredFound,
      missing: filteredMissing,
      extra,
      summary: {
        total: allDevices.length,
        found: found.length,
        missing: missing.length,
        extra: extra.length
      }
    })
  } catch (err) {
    console.error('Compare error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}