'use client'

import { CardFinancialOverview } from '@/components/dashboard/card-financial-overview'
import { CardTickets } from '@/components/dashboard/card-tickets'
import { CardDocuments } from '@/components/dashboard/card-documents'
import { CondominiumsGrid } from '@/components/condominiums/condominiums-grid'
import { AnalyticsOverview } from '@/components/dashboard/analytics-overview'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-[#0E141B]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-white">Dashboard Amministratore</h1>
          <p className="text-gray-300">
            Gestisci documenti, pagamenti, manutenzioni e comunicazioni
          </p>
        </div>

        {/* Condominiums Section */}
        <CondominiumsGrid />

        <div className="mt-10 mb-8">
          <AnalyticsOverview />
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
                    <p className="font-medium text-sm text-white">{comm.from}</p>
                    <p className="text-xs text-gray-400">{comm.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{comm.time}</p>
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
