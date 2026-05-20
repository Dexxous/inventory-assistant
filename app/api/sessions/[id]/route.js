import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nedostatečná oprávnění' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()

    const updated = await prisma.inventorySession.update({
      where: { id: parseInt(id) },
      data: body
    })

    return NextResponse.json({ session: updated })
  } catch (err) {
    console.error('Session PATCH error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}