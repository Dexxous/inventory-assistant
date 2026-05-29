import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, email, password, passwordConfirm } = body

    // Validace
    if (!name || !email || !password || !passwordConfirm) {
      return NextResponse.json(
        { error: 'Všechna pole jsou povinná' },
        { status: 400 }
      )
    }

    if (password !== passwordConfirm) {
      return NextResponse.json(
        { error: 'Hesla se neshodují' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Heslo musí mít alespoň 6 znaků' },
        { status: 400 }
      )
    }

    // Kontrola, zda uživatel již existuje
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Uživatel s tímto emailem již existuje' },
        { status: 400 }
      )
    }

    // Hashování hesla
    const hashedPassword = await bcrypt.hash(password, 10)

    // Vytvoření nového uživatele s default role 'USER'
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'USER',
        team: null
      }
    })

    return NextResponse.json(
      {
        message: 'Účet úspěšně vytvořen',
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Chyba při vytváření účtu' },
      { status: 500 }
    )
  }
}
