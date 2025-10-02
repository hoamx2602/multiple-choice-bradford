import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { Header } from '@/components/layout/header'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Multiple Choice Quiz App',
  description: 'A modern quiz application built with Next.js, shadcn/ui, and Prisma',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <div className="min-h-screen bg-background">
            <Header />
            <main>
              {children}
            </main>
          </div>
        </body>
      </html>
    </ClerkProvider>
  )
}