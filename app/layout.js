'use client'

import { SessionProvider } from 'next-auth/react'
import { Raleway } from 'next/font/google'
import './globals.css'

const raleway = Raleway({ variable: '--font-raleway', subsets: ['latin'] })

export default function RootLayout({ children }) {
  return (
    <html lang="cs">
      <body className={`${raleway.variable} antialiased`}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
