'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { 
  LayoutDashboard, 
  FileText, 
  Wallet, 
  Users, 
  Wrench, 
  MessageSquare, 
  Shield, 
  BarChart3,
  Settings,
  ClipboardList,
  Receipt,
  Upload,
  Building2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarItem {
  label: string
  href: string
  demoHref: string
  icon: React.ElementType
}

interface SidebarDemoProps {
  role: 'admin' | 'tenant' | 'supplier'
}

export function SidebarDemo({ role }: SidebarDemoProps) {
  const pathname = usePathname()

  const adminItems: SidebarItem[] = [
    { label: 'Dashboard', href: '/admin/dashboard', demoHref: '/demo/dashboards?type=admin', icon: LayoutDashboard },
    { label: 'Tutti i Condomini', href: '/admin/condomini', demoHref: '/demo/admin/condomini', icon: Building2 },
    { label: 'Migrazione Dati', href: '/admin/migration', demoHref: '/demo/admin/migration', icon: Upload },
    { label: 'Documenti', href: '/admin/documents', demoHref: '/demo/admin/documents', icon: FileText },
    { label: 'Pagamenti', href: '/admin/payments', demoHref: '/demo/admin/payments', icon: Wallet },
    { label: 'Assemblee', href: '/admin/assemblies', demoHref: '/demo/admin/assemblies', icon: Users },
    { label: 'Manutenzione', href: '/admin/maintenance', demoHref: '/demo/admin/maintenance', icon: Wrench },
    { label: 'Fornitori nella tua zona', href: '/admin/suppliers', demoHref: '/demo/admin/suppliers', icon: Building2 },
    { label: 'Comunicazioni', href: '/admin/communications', demoHref: '/demo/admin/communications', icon: MessageSquare },
    { label: 'Assicurazione', href: '/admin/insurance', demoHref: '/demo/admin/insurance', icon: Shield },
    { label: 'Report', href: '/admin/reports', demoHref: '/demo/admin/reports', icon: BarChart3 },
  ]

  const tenantItems: SidebarItem[] = [
    { label: 'Dashboard', href: '/tenant/dashboard', demoHref: '/demo/dashboards?type=tenant', icon: LayoutDashboard },
    { label: 'Documenti', href: '/tenant/documents', demoHref: '/demo/tenant/documents', icon: FileText },
    { label: 'Pagamenti', href: '/tenant/payments', demoHref: '/demo/tenant/payments', icon: Wallet },
    { label: 'Assemblee', href: '/tenant/assemblies', demoHref: '/demo/tenant/assemblies', icon: Users },
    { label: 'Manutenzione', href: '/tenant/maintenance', demoHref: '/demo/tenant/maintenance', icon: Wrench },
    { label: 'Assicurazione', href: '/tenant/insurance', demoHref: '/demo/tenant/insurance', icon: Shield },
    { label: 'Messaggi', href: '/tenant/messages', demoHref: '/demo/tenant/messages', icon: MessageSquare },
  ]

  const supplierItems: SidebarItem[] = [
    { label: 'Dashboard', href: '/supplier/dashboard', demoHref: '/demo/dashboards?type=supplier', icon: LayoutDashboard },
    { label: 'Ticket Assegnati', href: '/supplier/tickets', demoHref: '/demo/supplier/tickets', icon: Wrench },
    { label: 'Ordini di Lavoro', href: '/supplier/workorders', demoHref: '/demo/supplier/workorders', icon: ClipboardList },
    { label: 'Fatture', href: '/supplier/invoices', demoHref: '/demo/supplier/invoices', icon: Receipt },
    { label: 'Pagamenti', href: '/supplier/payments', demoHref: '/demo/supplier/payments', icon: Wallet },
    { label: 'Comunicazioni', href: '/supplier/communications', demoHref: '/demo/supplier/communications', icon: MessageSquare },
    { label: 'Impostazioni', href: '/supplier/settings', demoHref: '/demo/supplier/settings', icon: Settings },
  ]

  const items = role === 'admin' ? adminItems : role === 'tenant' ? tenantItems : supplierItems

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#1A1F26] border-r border-white/10 z-40">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-white/10 px-4">
          <Link href="/demo/select" className="flex items-center no-underline">
            <Image
              src="/images/condochiaro-logo.png"
              alt="CondoChiaro Logo"
              width={80}
              height={80}
              className="object-contain opacity-70 hover:opacity-100 transition-opacity"
              style={{ imageRendering: 'auto', backfaceVisibility: 'hidden', transform: 'translateZ(0)' }}
              priority
            />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2 list-none">
            {items.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.demoHref || pathname?.startsWith(item.demoHref.split('?')[0])
              
              return (
                <li key={item.demoHref}>
                  <Link
                    href={item.demoHref}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative z-10 text-gray-300 no-underline",
                      isActive
                        ? "bg-[#1FA9A0]/20 text-[#1FA9A0] border border-[#1FA9A0]/30"
                        : "hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <Link 
            href="/demo/select"
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors no-underline"
          >
            ← Torna alla selezione
          </Link>
        </div>
      </div>
    </aside>
  )
}

