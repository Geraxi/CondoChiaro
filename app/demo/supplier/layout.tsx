'use client'

import { SidebarDemo } from '@/components/layout/sidebar-demo'
import { Header } from '@/components/layout/header'

export default function DemoSupplierLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#0E141B]">
      <SidebarDemo role="supplier" />
      <Header role="supplier" />
      <main className="ml-64 mt-16 bg-[#0E141B] text-white">
        {children}
      </main>
    </div>
  )
}



