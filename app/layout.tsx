import type { Metadata } from 'next'
import './globals.css'
import { ToasterProvider } from '@/components/providers/toaster-provider'

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
    <html lang="it" className="dark" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        {children}
        <ToasterProvider />
      </body>
    </html>
  )
}
