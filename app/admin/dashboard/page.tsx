'use client'

import { CardFinancialOverview } from '@/components/dashboard/card-financial-overview'
import { CardTickets } from '@/components/dashboard/card-tickets'
import { CardDocuments } from '@/components/dashboard/card-documents'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CondominiumsGrid } from '@/components/condominiums/condominiums-grid'

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard Amministratore</h1>
          <p className="text-muted-foreground">
            Gestisci documenti, pagamenti, manutenzioni e comunicazioni
          </p>
        </div>

        {/* Condominiums Section */}
        <CondominiumsGrid />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Totale Entrate', value: '€92,000', trend: '+12%' },
            { label: 'Totale Uscite', value: '€58,000', trend: '+5%' },
            { label: 'Ticket Aperti', value: '5', trend: '-2' },
            { label: 'Documenti', value: '12', trend: '+3' },
          ].map((stat, idx) => (
            <Card key={idx}>
              <CardHeader className="pb-2">
                <CardDescription>{stat.label}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.trend} dal mese scorso</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <CardFinancialOverview />
          </div>
          <div className="space-y-6">
            <CardTickets />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CardDocuments />
          <Card>
            <CardHeader>
              <CardTitle>Comunicazioni Recenti</CardTitle>
              <CardDescription>Messaggi da condòmini e fornitori</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { from: 'Mario Rossi', message: 'Richiesta informazioni pagamento', time: '2h fa' },
                  { from: 'Luisa Bianchi', message: 'Segnalazione problema ascensore', time: '5h fa' },
                ].map((comm, idx) => (
                  <div key={idx} className="p-3 bg-[#0E141B] rounded-lg border border-white/5">
                    <p className="font-medium text-sm">{comm.from}</p>
                    <p className="text-xs text-muted-foreground">{comm.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{comm.time}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
