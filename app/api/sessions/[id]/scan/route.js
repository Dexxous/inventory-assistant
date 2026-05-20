import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Nepřihlášen' }, { status: 401 })

    const { id } = await params
    const sessionId = parseInt(id)
    const { serialNumber, note } = await request.json()

    if (!serialNumber) {
      return NextResponse.json({ error: 'Chybí sériové číslo' }, { status: 400 })
    }

    const inventorySession = await prisma.inventorySession.findUnique({
      where: { id: sessionId }
    })

    if (!inventorySession) {
      return NextResponse.json({ error: 'Inventura nenalezena' }, { status: 404 })
    }

    const device = await prisma.device.findUnique({
      where: { serialNumber }
    })

    if (device) {
      await prisma.deviceRecord.create({
        data: {
          status: 'FOUND',
          note: note ?? null,
          deviceId: device.id,
          sessionId,
          userId: session.user.id
        }
      })
      return NextResponse.json({ status: 'FOUND', device })
    } else {
      return NextResponse.json({ status: 'NEW', serialNumber })
    }
  } catch (err) {
    console.error('Scan error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}