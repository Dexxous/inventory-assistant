import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(request, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Nepřihlášen' }, { status: 401 })

  const body = await request.json()
  const { serialNumber, name, team, note, sessionId } = body

  const device = await prisma.device.create({
    data: {
      serialNumber,
      name: name ?? 'Neznámé zařízení',
      team: team ?? null,
    }
  })

  // Pokud je sessionId, vytvoř device record
  if (sessionId) {
    await prisma.deviceRecord.create({
      data: {
        status: 'NEW',
        note: note ?? null,
        deviceId: device.id,
        sessionId: parseInt(sessionId),
        userId: session.user.id
      }
    })
  }

  return NextResponse.json({ success: true, device })
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nedostatečná oprávnění' }, { status: 403 })
    }

    const { id } = await params

    await prisma.deviceRecord.deleteMany({
      where: { deviceId: parseInt(id) }
    })

    await prisma.device.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Device DELETE error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}