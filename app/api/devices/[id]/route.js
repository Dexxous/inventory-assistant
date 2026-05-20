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

  await prisma.deviceRecord.create({
    data: {
      status: 'NEW',
      note: note ?? null,
      deviceId: device.id,
      sessionId: parseInt(sessionId),
      userId: session.user.id
    }
  })

  return NextResponse.json({ success: true, device })
}