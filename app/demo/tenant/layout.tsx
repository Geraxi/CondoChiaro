'use client'

import { SidebarDemo } from '@/components/layout/sidebar-demo'
import { Header } from '@/components/layout/header'

export default function DemoTenantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#0E141B]">
      <SidebarDemo role="tenant" />
      <Header role="tenant" />
      <main className="ml-64 mt-16 bg-[#0E141B] text-white">
        {children}
      </main>
    </div>
  )
}



