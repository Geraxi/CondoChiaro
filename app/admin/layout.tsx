'use client'

import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#0E141B]">
      <Sidebar role="admin" />
      <Header role="admin" />
      <main className="ml-64 mt-16 bg-[#0E141B] text-white">
        {children}
      </main>
    </div>
  )
}
