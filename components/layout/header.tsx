'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Bell, Search, LogOut, User, MessageSquare, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

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

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export function Header({ role }: HeaderProps) {
  const [showAI, setShowAI] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [aiMessages, setAiMessages] = useState<Message[]>([])
  const [aiLoading, setAiLoading] = useState(false)
  const [condominiumId, setCondominiumId] = useState<string | null>(null)
  const notificationRef = useRef<HTMLDivElement | null>(null)
  const aiMessagesEndRef = useRef<HTMLDivElement | null>(null)

  const notifications = notificationsByRole[role] ?? []
  const communicationsLink =
    role === 'admin'
      ? '/admin/communications'
      : role === 'tenant'
        ? '/tenant/messages'
        : '/supplier/communications'

  // Load initial AI greeting
  useEffect(() => {
    if (showAI && aiMessages.length === 0) {
      setAiMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: 'Ciao! Sono CondoChiaro AI, il tuo assistente per la gestione condominiale. Posso aiutarti con:\n\n• Informazioni su documenti e pagamenti\n• Stato di ticket e manutenzioni\n• Calcoli e statistiche\n• Domande sulle procedure\n\nFammi una domanda per iniziare!',
          timestamp: new Date(),
        },
      ])
    }
  }, [showAI, aiMessages.length])

  // Auto-scroll to latest message
  useEffect(() => {
    aiMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [aiMessages])

  // Get current user's condominium ID (if admin)
  useEffect(() => {
    if (role === 'admin' && showAI) {
      const fetchCondominiumId = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: condominiums } = await supabase
            .from('condominiums')
            .select('id')
            .eq('admin_id', user.id)
            .limit(1)
            .single()

          if (condominiums) {
            setCondominiumId(condominiums.id)
          }
        }
      }
      fetchCondominiumId()
    }
  }, [role, showAI])

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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cerca documenti, pagamenti..."
            className="w-full pl-10 pr-4 py-2 bg-[#0E141B] border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#1FA9A0]"
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
            className="relative p-2 text-gray-400 hover:text-white transition-colors"
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
                  <p className="text-sm font-semibold text-white">Notifiche</p>
                  <p className="text-xs text-gray-400">
                    {notifications.length > 0 ? `${notifications.length} nuove` : 'Nessuna notifica'}
                  </p>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-gray-400 hover:text-white"
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
                      <p className="text-xs text-gray-400 mt-1">{notification.description}</p>
                      <p className="text-[11px] text-gray-500 mt-2">{notification.time}</p>
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
            className="p-2 text-gray-400 hover:text-white transition-colors"
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
              <h3 className="font-semibold flex items-center gap-2 text-white">
                <MessageSquare className="h-5 w-5 text-[#1FA9A0]" />
                Assistente AI
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Fai una domanda sulla gestione del condominio
              </p>
            </div>
            <button
              onClick={() => setShowAI(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            <div className="space-y-3">
              {aiMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] ${
                      message.role === 'user'
                        ? 'bg-[#1FA9A0] text-white rounded-lg p-3'
                        : 'bg-[#0E141B] rounded-lg p-3 border border-white/5'
                    }`}
                  >
                    <p
                      className={`text-sm whitespace-pre-wrap ${
                        message.role === 'user' ? 'text-white' : 'text-gray-300'
                      }`}
                    >
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}
              {aiLoading && (
                <div className="flex gap-2 justify-start">
                  <div className="bg-[#0E141B] rounded-lg p-3 border border-white/5 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 text-[#1FA9A0] animate-spin" />
                    <span className="text-sm text-gray-400">Elaborazione...</span>
                  </div>
                </div>
              )}
              <div ref={aiMessagesEndRef} />
            </div>
          </div>
          <div className="p-4 border-t border-white/10">
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const input = e.currentTarget.querySelector('input') as HTMLInputElement
                const query = input?.value.trim()

                if (!query || aiLoading) return

                // Add user message
                const userMessage: Message = {
                  id: `user-${Date.now()}`,
                  role: 'user',
                  content: query,
                  timestamp: new Date(),
                }
                setAiMessages((prev) => [...prev, userMessage])
                input.value = ''
                setAiLoading(true)

                try {
                  // Get auth token
                  const {
                    data: { session },
                  } = await supabase.auth.getSession()

                  if (!session) {
                    throw new Error('Non autenticato')
                  }

                  // Call AI assistant API
                  const response = await fetch('/api/ai/assistant', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${session.access_token}`,
                    },
                    body: JSON.stringify({
                      query,
                      condominiumId,
                      role,
                    }),
                  })

                  const data = await response.json()

                  if (!data.success || !data.data) {
                    throw new Error(data.message || 'Errore nella risposta AI')
                  }

                  // Add AI response
                  const aiMessage: Message = {
                    id: `ai-${Date.now()}`,
                    role: 'assistant',
                    content: data.data.answer,
                    timestamp: new Date(),
                  }
                  setAiMessages((prev) => [...prev, aiMessage])
                } catch (error: any) {
                  console.error('AI query error:', error)
                  toast.error(error.message || 'Errore durante la richiesta')
                  const errorMessage: Message = {
                    id: `error-${Date.now()}`,
                    role: 'assistant',
                    content: `Mi dispiace, si è verificato un errore: ${error.message}. Riprova più tardi.`,
                    timestamp: new Date(),
                  }
                  setAiMessages((prev) => [...prev, errorMessage])
                } finally {
                  setAiLoading(false)
                }
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                placeholder="Chiedi qualcosa..."
                className="flex-1 px-3 py-2 bg-[#0E141B] border border-white/10 rounded-lg text-sm focus:outline-none focus:border-[#1FA9A0]"
                disabled={aiLoading}
              />
              <Button
                type="submit"
                size="sm"
                className="bg-[#1FA9A0] hover:bg-[#17978E]"
                disabled={aiLoading}
              >
                {aiLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Invia'
                )}
              </Button>
            </form>
          </div>
        </div>
      )}
    </header>
  )
}
