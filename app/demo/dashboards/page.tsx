'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const SafeStats = dynamic(() => import('@/components/ui/safe-stats').then(mod => ({ default: mod.SafeStats })))
import Link from 'next/link'
import { ArrowLeft, Shield, Users, Wrench, Eye, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SidebarDemo } from '@/components/layout/sidebar-demo'
import { Header } from '@/components/layout/header'

// Mock data for demos
const mockAdminData = {
  condominiums: [
    { id: '1', name: 'Residenza Milano Centro', units: 45, tenants: 42, revenue: 11250, address: 'Via Garibaldi 15, Milano' },
    { id: '2', name: 'Palazzo Roma Nord', units: 32, tenants: 30, revenue: 8000, address: 'Via dei Fori Imperiali 8, Roma' },
    { id: '3', name: 'Villa Firenze Sud', units: 28, tenants: 26, revenue: 6500, address: 'Viale dei Colli 22, Firenze' },
    { id: '4', name: 'Torre Napoli Centro', units: 60, tenants: 58, revenue: 14500, address: 'Via Toledo 45, Napoli' },
  ],
  stats: {
    totalRevenue: 19250,
    pendingPayments: 3250,
    activeTickets: 3,
    documents: 12,
  },
  recentCommunications: [
    { from: 'Mario Rossi', message: 'Richiesta informazioni pagamento', time: '2h fa' },
    { from: 'Luisa Bianchi', message: 'Segnalazione problema ascensore', time: '5h fa' },
    { from: 'Giuseppe Verdi', message: 'Conferma assemblea', time: '1d fa' },
  ],
  upcomingDeadlines: [
    { title: 'Bilancio Consuntivo 2023', due: '28 Feb 2024', type: 'document' },
    { title: 'Assemblea Ordinaria', due: '15 Mar 2024', type: 'assembly' },
  ],
}

const mockTenantData = {
  balance: 1250.00,
  nextDue: '15 Feb 2024',
  documents: 8,
  activeMaintenance: 2,
  upcomingPayments: [
    { title: 'Quota condominiale', amount: 250, due: '15 Feb 2024' },
    { title: 'Fondo manutenzione', amount: 150, due: '20 Feb 2024' },
  ],
  recentDocuments: [
    { name: 'Verbale Assemblea Gennaio', date: '10 Gen 2024', type: 'verbale' },
    { name: 'Bilancio Preventivo 2024', date: '5 Gen 2024', type: 'bilancio' },
  ],
}

const mockSupplierData = {
  activeTickets: 2,
  completedOrders: 15,
  pendingInvoices: 3250,
  inProgressOrders: 3,
  performance: [
    { month: 'Gen', completati: 12, in_lavoro: 3 },
    { month: 'Feb', completati: 15, in_lavoro: 2 },
    { month: 'Mar', completati: 18, in_lavoro: 4 },
  ],
  recentInvoices: [
    { invoice: 'FAT-2024-001', amount: 1250, date: '10 Feb 2024', status: 'pagato' },
    { invoice: 'FAT-2024-002', amount: 850, date: '15 Feb 2024', status: 'in_attesa' },
    { invoice: 'FAT-2024-003', amount: 1150, date: '20 Feb 2024', status: 'in_attesa' },
  ],
  workOrders: [
    { id: 'ORD-001', title: 'Riparazione caldaia', building: 'Residenza Milano Centro', status: 'in_lavoro', progress: 75 },
    { id: 'ORD-002', title: 'Manutenzione ascensore', building: 'Palazzo Roma Nord', status: 'completato', progress: 100 },
  ],
}

export default function DashboardsDemo() {
  const [activeTab, setActiveTab] = useState('admin')

  // Set initial tab from URL query parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const type = params.get('type')
      if (type && ['admin', 'tenant', 'supplier'].includes(type)) {
        setActiveTab(type)
      }
    }
  }, [])

  // Determine which sidebar to show based on active tab
  const getSidebarRole = () => {
    if (activeTab === 'admin') return 'admin'
    if (activeTab === 'tenant') return 'tenant'
    if (activeTab === 'supplier') return 'supplier'
    return 'admin'
  }

  return (
    <div className="min-h-screen bg-[#0E141B]">
      {/* Sidebar and Header */}
      <SidebarDemo role={getSidebarRole()} />
      <Header role={getSidebarRole()} />
      
      {/* Demo Banner */}
      <div className="ml-64 bg-gradient-to-r from-[#1FA9A0]/20 to-[#1FA9A0]/10 border-b border-[#1FA9A0]/30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Eye className="h-5 w-5 text-[#1FA9A0]" />
            <div>
              <p className="font-semibold text-white">Modalità Demo</p>
              <p className="text-sm text-gray-300">Visualizzazione non autenticata - Dati di esempio</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/demo/select" className="no-underline">
              <Button variant="outline" size="sm" className="border-[#1FA9A0]/50 hover:bg-[#1FA9A0]/10 hover:border-[#1FA9A0]">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Torna alla Selezione
              </Button>
            </Link>
            <Link href="/" className="no-underline">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                Esci dalla Demo
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <main className="ml-64 mt-16 bg-[#0E141B] text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-white">Demo Dashboard CondoChiaro</h1>
              <p className="text-gray-300">
                Esplora tutte le funzionalità delle dashboard per Amministratori, Condòmini e Fornitori
              </p>
            </div>
            <Link href="/demo/select" className="no-underline">
              <Button variant="outline" className="border-[#1FA9A0]/50 hover:bg-[#1FA9A0]/10 hover:border-[#1FA9A0]">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Cambia Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-[#1A1F26]">
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Amministratore
            </TabsTrigger>
            <TabsTrigger value="tenant" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Condòmino
            </TabsTrigger>
            <TabsTrigger value="supplier" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Fornitore
            </TabsTrigger>
          </TabsList>

          {/* Admin Dashboard Demo */}
          <TabsContent value="admin" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-3xl font-bold mb-2 text-white">Dashboard Amministratore</h2>
              <p className="text-gray-300">Gestisci documenti, pagamenti, manutenzioni e comunicazioni</p>
            </div>

            {/* Condominiums Grid */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">I Miei Condomini</h2>
                <Link href="/demo/admin/condomini" className="no-underline">
                  <Button variant="outline" className="border-[#1FA9A0]/50 hover:bg-[#1FA9A0]/10">
                    Vedi Tutti
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mockAdminData.condominiums.map((condo) => (
                  <Link key={condo.id} href={`/demo/admin/condomini/${condo.id}`} className="no-underline">
                    <Card className="bg-[#1A1F26] border-white/10 hover:border-[#1FA9A0]/30 transition cursor-pointer">
                      <CardHeader>
                        <CardTitle className="text-white">{condo.name}</CardTitle>
                        <CardDescription>{condo.address || `${condo.units} unità • ${condo.tenants} condòmini`}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-400">Entrate Mensili</p>
                            <p className="text-2xl font-bold text-[#1FA9A0]"><SafeStats value={condo.revenue} prefix="€" /></p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-400">{condo.units} unità</p>
                            <p className="text-sm text-gray-400">{condo.tenants} condòmini</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card className="bg-[#1A1F26] border-white/10">
                <CardHeader className="pb-2">
                  <CardDescription>Entrate Totali</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#1FA9A0]"><SafeStats value={mockAdminData.stats.totalRevenue} prefix="€" /></div>
                </CardContent>
              </Card>
              <Card className="bg-[#1A1F26] border-white/10">
                <CardHeader className="pb-2">
                  <CardDescription>Pagamenti in Attesa</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-400"><SafeStats value={mockAdminData.stats.pendingPayments} prefix="€" /></div>
                </CardContent>
              </Card>
              <Card className="bg-[#1A1F26] border-white/10">
                <CardHeader className="pb-2">
                  <CardDescription>Ticket Attivi</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-400">{mockAdminData.stats.activeTickets}</div>
                </CardContent>
              </Card>
              <Card className="bg-[#1A1F26] border-white/10">
                <CardHeader className="pb-2">
                  <CardDescription>Documenti</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockAdminData.stats.documents}</div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-[#1A1F26] border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Comunicazioni Recenti</CardTitle>
                  <CardDescription>Messaggi da condòmini e fornitori</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockAdminData.recentCommunications.map((comm, idx) => (
                      <div key={idx} className="p-3 bg-[#0E141B] rounded-lg border border-white/5">
                        <p className="font-medium text-sm text-white">{comm.from}</p>
                        <p className="text-xs text-gray-400">{comm.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{comm.time}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1A1F26] border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Prossime Scadenze</CardTitle>
                  <CardDescription>Documenti e appuntamenti importanti</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockAdminData.upcomingDeadlines.map((deadline, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-[#0E141B] rounded-lg border border-white/5">
                        <div>
                          <p className="font-medium text-sm text-white">{deadline.title}</p>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {deadline.type === 'document' ? '📄 Documento' : '📅 Assemblea'}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-400">{deadline.due}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tenant Dashboard Demo */}
          <TabsContent value="tenant" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-3xl font-bold mb-2 text-white">Dashboard Condòmino</h2>
              <p className="text-gray-300">Consulta documenti, saldo e segnala manutenzioni</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="bg-[#1A1F26] border-white/10">
                <CardHeader className="pb-2">
                  <CardDescription>Saldo Attuale</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#1FA9A0]"><SafeStats value={mockTenantData.balance} prefix="€" options={{ minimumFractionDigits: 2 }} /></div>
                  <p className="text-xs text-gray-400 mt-1">Prossima scadenza: {mockTenantData.nextDue}</p>
                </CardContent>
              </Card>
              <Card className="bg-[#1A1F26] border-white/10">
                <CardHeader className="pb-2">
                  <CardDescription>Documenti</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockTenantData.documents}</div>
                  <p className="text-xs text-gray-400 mt-1">Ultimo aggiornamento: oggi</p>
                </CardContent>
              </Card>
              <Card className="bg-[#1A1F26] border-white/10">
                <CardHeader className="pb-2">
                  <CardDescription>Manutenzioni Attive</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockTenantData.activeMaintenance}</div>
                  <p className="text-xs text-gray-400 mt-1">In attesa di risposta</p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-[#1A1F26] border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Prossime Scadenze</CardTitle>
                  <CardDescription>Pagamenti e appuntamenti</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockTenantData.upcomingPayments.map((payment, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-[#0E141B] rounded-lg border border-white/5">
                        <div>
                          <p className="font-medium text-sm text-white">{payment.title}</p>
                          <p className="text-xs text-gray-400">€{payment.amount}</p>
                        </div>
                        <p className="text-xs text-gray-400">{payment.due}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1A1F26] border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Documenti Recenti</CardTitle>
                  <CardDescription>Ultimi documenti pubblicati</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockTenantData.recentDocuments.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-[#0E141B] rounded-lg border border-white/5">
                        <div>
                          <p className="font-medium text-sm text-white">{doc.name}</p>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {doc.type === 'verbale' ? '📄 Verbale' : '📊 Bilancio'}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-400">{doc.date}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Supplier Dashboard Demo */}
          <TabsContent value="supplier" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-3xl font-bold mb-2 text-white">Dashboard Fornitore</h2>
              <p className="text-gray-300">Gestisci ticket, ordini di lavoro e fatture</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card className="bg-[#1A1F26] border-white/10">
                <CardHeader className="pb-2">
                  <CardDescription>Ticket Attivi</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#1FA9A0]">{mockSupplierData.activeTickets}</div>
                </CardContent>
              </Card>
              <Card className="bg-[#1A1F26] border-white/10">
                <CardHeader className="pb-2">
                  <CardDescription>Ordini Completati</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-400">{mockSupplierData.completedOrders}</div>
                </CardContent>
              </Card>
              <Card className="bg-[#1A1F26] border-white/10">
                <CardHeader className="pb-2">
                  <CardDescription>Fatture Pendenti</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-400"><SafeStats value={mockSupplierData.pendingInvoices} prefix="€" /></div>
                </CardContent>
              </Card>
              <Card className="bg-[#1A1F26] border-white/10">
                <CardHeader className="pb-2">
                  <CardDescription>In Lavorazione</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-400">{mockSupplierData.inProgressOrders}</div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card className="bg-[#1A1F26] border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Storico Pagamenti</CardTitle>
                  <CardDescription>Fatture e pagamenti recenti</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockSupplierData.recentInvoices.map((invoice, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-[#0E141B] rounded-lg border border-white/5">
                        <div>
                          <p className="font-medium text-sm text-white">{invoice.invoice}</p>
                          <p className="text-xs text-gray-400">{invoice.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-white"><SafeStats value={invoice.amount} prefix="€" /></p>
                          <Badge 
                            variant={invoice.status === 'pagato' ? 'default' : 'secondary'}
                            className={`text-xs ${invoice.status === 'pagato' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}
                          >
                            {invoice.status === 'pagato' ? 'Pagato' : 'In attesa'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1A1F26] border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Ordini di Lavoro</CardTitle>
                  <CardDescription>Lavori in corso e completati</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockSupplierData.workOrders.map((order, idx) => (
                      <div key={idx} className="p-3 bg-[#0E141B] rounded-lg border border-white/5">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium text-sm text-white">{order.id} - {order.title}</p>
                            <p className="text-xs text-gray-400">{order.building}</p>
                          </div>
                          <Badge 
                            variant={order.status === 'completato' ? 'default' : 'secondary'}
                            className={order.status === 'completato' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}
                          >
                            {order.status === 'completato' ? 'Completato' : `In Lavoro (${order.progress}%)`}
                          </Badge>
                        </div>
                        {order.status === 'in_lavoro' && (
                          <div className="w-full bg-[#1A1F26] rounded-full h-2 mt-2">
                            <div 
                              className="bg-[#1FA9A0] h-2 rounded-full transition-all"
                              style={{ width: `${order.progress}%` }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <Card className="mt-8 bg-gradient-to-r from-[#1FA9A0]/10 to-[#1FA9A0]/5 border-[#1FA9A0]/30">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2 text-white">Pronto a iniziare?</h3>
              <p className="text-gray-300 mb-6">
                Registrati gratuitamente e inizia a gestire il tuo condominio con CondoChiaro
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/register" className="no-underline">
                  <Button className="bg-[#1FA9A0] hover:bg-[#17978E]">
                    Registrati Gratis
                  </Button>
                </Link>
                <Link href="/login" className="no-underline">
                  <Button variant="outline">
                    Accedi
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </main>
    </div>
  )
}

