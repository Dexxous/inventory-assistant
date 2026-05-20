import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ sessions: [] })

    const sessions = await prisma.inventorySession.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json({ sessions })
  } catch (err) {
    console.error('Sessions GET error:', err)
    return NextResponse.json({ sessions: [] })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nedostatečná oprávnění' }, { status: 403 })
    }

    const { name } = await request.json()
    const newSession = await prisma.inventorySession.create({
      data: { name }
    })
    return NextResponse.json({ session: newSession })
  } catch (err) {
    console.error('Sessions POST error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}