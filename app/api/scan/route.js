import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Nepřihlášen' }, { status: 401 })

    const { serialNumber, note } = await request.json()

    if (!serialNumber) {
      return NextResponse.json({ error: 'Chybí sériové číslo' }, { status: 400 })
    }

    const device = await prisma.device.findUnique({
      where: { serialNumber }
    })

    if (device) {
      return NextResponse.json({ status: 'FOUND', device })
    } else {
      return NextResponse.json({ status: 'NEW', serialNumber })
    }
  } catch (err) {
    console.error('Scan error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
