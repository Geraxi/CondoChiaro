'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Bell, Search, LogOut, User, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  role: 'admin' | 'tenant' | 'supplier'
}

interface NotificationItem {
  id: string
  title: string
  description: string
  time: string
  actionHref: string
}

const notificationsByRole: Record<HeaderProps['role'], NotificationItem[]> = {
  admin: [
    {
      id: 'admin-notif-1',
      title: 'Nuova richiesta di manutenzione',
      description: 'Ascensore Blocco A - In attesa di assegnazione',
      time: '2 min fa',
      actionHref: '/admin/maintenance'
    },
    {
      id: 'admin-notif-2',
      title: 'Pagamento ricevuto',
      description: 'Quota condominiale da Maria Rossi',
      time: '15 min fa',
      actionHref: '/admin/payments'
    },
    {
      id: 'admin-notif-3',
      title: 'Assemblea programmata',
      description: 'Assemblea straordinaria il 12 luglio',
      time: '1h fa',
      actionHref: '/admin/assemblies'
    }
  ],
  tenant: [
    {
      id: 'tenant-notif-1',
      title: 'Nuovo documento disponibile',
      description: 'Verbale assemblea del 5 giugno',
      time: '5 min fa',
      actionHref: '/tenant/documents'
    },
    {
      id: 'tenant-notif-2',
      title: 'Promemoria pagamento',
      description: 'Scadenza quota mensile il 30 giugno',
      time: '30 min fa',
      actionHref: '/tenant/payments'
    },
    {
      id: 'tenant-notif-3',
      title: 'Messaggio dall’amministratore',
      description: 'Richiesta conferma disponibilità per assemblea',
      time: '2h fa',
      actionHref: '/tenant/messages'
    }
  ],
  supplier: [
    {
      id: 'supplier-notif-1',
      title: 'Nuovo ticket assegnato',
      description: 'Intervento idraulico via Roma 12',
      time: '3 min fa',
      actionHref: '/supplier/tickets'
    },
    {
      id: 'supplier-notif-2',
      title: 'Richiesta fattura',
      description: 'Condominio Aurora richiede fattura maggio',
      time: '42 min fa',
      actionHref: '/supplier/invoices'
    },
    {
      id: 'supplier-notif-3',
      title: 'Messaggio amministratore',
      description: 'Aggiornamento su ordine di lavoro #124',
      time: '3h fa',
      actionHref: '/supplier/communications'
    }
  ]
}

export function Header({ role }: HeaderProps) {
  const [showAI, setShowAI] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const notificationRef = useRef<HTMLDivElement | null>(null)

  const notifications = notificationsByRole[role] ?? []
  const communicationsLink =
    role === 'admin'
      ? '/admin/communications'
      : role === 'tenant'
        ? '/tenant/messages'
        : '/supplier/communications'

  useEffect(() => {
    if (!showNotifications) return

    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showNotifications])

  const handleLogout = async () => {
    // TODO: Implement Supabase logout
    window.location.href = '/login'
  }

  return (
    <header className="fixed top-0 right-0 left-64 h-16 bg-[#1A1F26] border-b border-white/10 z-30 flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cerca documenti, pagamenti..."
            className="w-full pl-10 pr-4 py-2 bg-[#0E141B] border border-white/10 rounded-lg text-sm focus:outline-none focus:border-[#1FA9A0]"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Ask AI Button */}
        <Button
          onClick={() => {
            setShowNotifications(false)
            setShowAI((prev) => !prev)
          }}
          variant="outline"
          className="bg-[#1FA9A0]/10 border-[#1FA9A0]/30 text-[#1FA9A0] hover:bg-[#1FA9A0]/20"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Ask AI
        </Button>

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => {
              setShowAI(false)
              setShowNotifications((prev) => !prev)
            }}
            className="relative p-2 text-muted-foreground hover:text-white transition-colors"
            aria-haspopup="true"
            aria-expanded={showNotifications}
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-[#FF6B6B] rounded-full"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-[#1A1F26] border border-white/10 rounded-xl shadow-lg overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <div>
                  <p className="text-sm font-semibold">Notifiche</p>
                  <p className="text-xs text-muted-foreground">
                    {notifications.length > 0 ? `${notifications.length} nuove` : 'Nessuna notifica'}
                  </p>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-muted-foreground hover:text-white"
                >
                  Chiudi
                </button>
              </div>
              <ul className="max-h-80 overflow-y-auto divide-y divide-white/5">
                {notifications.map((notification) => (
                  <li key={notification.id}>
                    <Link
                      href={notification.actionHref}
                      className="block px-4 py-3 hover:bg-white/5 transition-colors"
                      onClick={() => setShowNotifications(false)}
                    >
                      <p className="text-sm font-medium text-white">{notification.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notification.description}</p>
                      <p className="text-[11px] text-muted-foreground/80 mt-2">{notification.time}</p>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="px-4 py-3 border-t border-white/10">
                <Link
                  href={communicationsLink}
                  className="text-sm text-[#1FA9A0] hover:text-[#27C5B9]"
                  onClick={() => setShowNotifications(false)}
                >
                  Vedi tutte le comunicazioni →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-[#1FA9A0] flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-muted-foreground hover:text-white transition-colors"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* AI Chat Panel */}
      {showAI && (
        <div className="absolute top-full right-6 mt-2 w-96 h-[500px] bg-[#1A1F26] border border-white/10 rounded-lg shadow-lg z-50 flex flex-col">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-[#1FA9A0]" />
                Assistente AI
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Fai una domanda sulla gestione del condominio
              </p>
            </div>
            <button
              onClick={() => setShowAI(false)}
              className="text-muted-foreground hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            <div className="space-y-3">
              {/* Example AI message */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <div className="bg-[#0E141B] rounded-lg p-3 border border-white/5">
                    <p className="text-sm text-gray-300">
                      Ciao! Sono il tuo assistente AI per la gestione condominiale. Posso aiutarti con:
                    </p>
                    <ul className="text-xs text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                      <li>Informazioni su documenti e pagamenti</li>
                      <li>Stato di ticket e manutenzioni</li>
                      <li>Calcoli e statistiche</li>
                      <li>Domande sulle procedure</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="text-center text-muted-foreground text-xs py-4">
                Inizia a chiedere qualcosa...
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-white/10">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const input = e.currentTarget.querySelector('input') as HTMLInputElement
                if (input?.value.trim()) {
                  // TODO: Implement AI chat functionality
                  input.value = ''
                }
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                placeholder="Chiedi qualcosa..."
                className="flex-1 px-3 py-2 bg-[#0E141B] border border-white/10 rounded-lg text-sm focus:outline-none focus:border-[#1FA9A0]"
              />
              <Button type="submit" size="sm" className="bg-[#1FA9A0] hover:bg-[#17978E]">
                Invia
              </Button>
            </form>
          </div>
        </div>
      )}
    </header>
  )
}
