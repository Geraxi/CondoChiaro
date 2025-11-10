'use client'

import { Suspense } from 'react'
import { CardFinancialOverview } from '@/components/dashboard/card-financial-overview'
import { CardTickets } from '@/components/dashboard/card-tickets'
import { CardDocuments } from '@/components/dashboard/card-documents'
import { CardEscalation } from '@/components/dashboard/card-escalation'
import { CondominiumsGrid } from '@/components/condominiums/condominiums-grid'
import { AnalyticsOverview } from '@/components/dashboard/analytics-overview'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ErrorBoundary } from '@/components/ui/error-boundary'

function DashboardContent() {
  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-white">Dashboard Amministratore</h1>
        <p className="text-gray-300">
          Gestisci documenti, pagamenti, manutenzioni e comunicazioni
        </p>
      </div>

      {/* Condominiums Section */}
      <Suspense fallback={<div className="text-gray-400">Caricamento condomini...</div>}>
        <CondominiumsGrid />
      </Suspense>

      <div className="mt-10 mb-8">
        <Suspense fallback={<div className="text-gray-400">Caricamento analytics...</div>}>
          <AnalyticsOverview />
        </Suspense>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <ErrorBoundary>
            <Suspense fallback={<div className="text-gray-400 p-6 bg-[#1A1F26] rounded-2xl">Caricamento grafici finanziari...</div>}>
              <CardFinancialOverview />
            </Suspense>
          </ErrorBoundary>
        </div>
        <div className="space-y-6">
          <ErrorBoundary>
            <Suspense fallback={<div className="text-gray-400 p-4 bg-[#1A1F26] rounded-lg">Caricamento...</div>}>
              <CardEscalation />
            </Suspense>
          </ErrorBoundary>
          <ErrorBoundary>
            <Suspense fallback={<div className="text-gray-400 p-4 bg-[#1A1F26] rounded-lg">Caricamento...</div>}>
              <CardTickets />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ErrorBoundary>
          <Suspense fallback={<div className="text-gray-400 p-4 bg-[#1A1F26] rounded-lg">Caricamento documenti...</div>}>
            <CardDocuments />
          </Suspense>
        </ErrorBoundary>
        <Card className="bg-[#1A1F26] border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Comunicazioni Recenti</CardTitle>
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
    </>
  )
}

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-[#0E141B]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <ErrorBoundary>
          <DashboardContent />
        </ErrorBoundary>
      </div>
    </div>
  )
}
