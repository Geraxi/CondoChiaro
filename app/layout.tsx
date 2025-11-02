import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ToasterProvider } from '@/components/providers/toaster-provider'
import { AuthProvider } from '@/components/providers/auth-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CondoChiaro - Gestione Condominiale',
  description: 'Software gestionale condominiale tutto-in-uno per amministratori, condòmini e fornitori',
  keywords: 'condominio, gestione, amministratore, software, condominiale, Italia',
  authors: [{ name: 'CondoChiaro' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <ToasterProvider />
        </AuthProvider>
      </body>
    </html>
  )
}
