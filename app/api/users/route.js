import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

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

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Nedostatečná oprávnění' }, { status: 403 })
    }

    const { name, email, password, role, team } = await request.json()

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Uživatel s tímto emailem již existuje' }, { status: 400 })
    }

    const hash = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { name, email, password: hash, role, team: team || null }
    })

    return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email } })
  } catch (err) {
    console.error('Users POST error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}