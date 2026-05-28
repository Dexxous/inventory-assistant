import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import prisma from './prisma'
import { checkLoginLimit } from './rateLimit'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Heslo', type: 'password' }
      },
      async authorize(credentials, req) {
        const ip = req?.headers?.['x-forwarded-for'] ?? 'unknown'
        const limit = await checkLoginLimit(ip)

        if (!limit.allowed) {
        throw new Error(limit.message)
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })
        if (!user) return null

        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          team: user.team
        }
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.team = user.team
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      session.user.role = token.role
      session.user.team = token.team
      session.user.id = token.id
      return session
    }
  },
  pages: {
    signIn: '/login'
  },
  session: { strategy: 'jwt' }
}