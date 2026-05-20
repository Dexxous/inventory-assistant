import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Nepřihlášen' }, { status: 401 })

    const { id } = await params
    const { deviceId } = await request.json()

    await prisma.deviceRecord.create({
      data: {
        status: 'MISSING',
        deviceId: parseInt(deviceId),
        sessionId: parseInt(id),
        userId: session.user.id
      }
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}