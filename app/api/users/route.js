import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { userSchema } from '@/lib/validators'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nedostatečná oprávnění' }, { status: 403 })
    }

    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, team: true, createdAt: true },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({ users })
  } catch (err) {
    console.error('Users GET error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Nepřihlášen' }, { status: 401 })

    const { id } = await params
    const sessionId = parseInt(id)

    const body = await request.json()
    const validation = scanSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { serialNumber, note } = validation.data

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





