import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'

export default function SupplierLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar role="supplier" />
      <Header role="supplier" />
      <main className="ml-64 mt-16">
        {children}
      </main>
    </div>
  )
}
