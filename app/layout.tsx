import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ToasterProvider } from '@/components/providers/toaster-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CondoChiaro - Gestione Condominiale',
  description: 'Software gestionale condominiale tutto-in-uno',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it">
      <body className={inter.className}>
        {children}
        <ToasterProvider />
      </body>
    </html>
  )
}
