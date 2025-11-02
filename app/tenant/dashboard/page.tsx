'use client'

import Link from 'next/link'
import { FileText, Wallet, Wrench, MessageSquare } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CardDocuments } from '@/components/dashboard/card-documents'

export default function TenantDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard Condòmino</h1>
          <p className="text-muted-foreground">
            Consulta documenti, saldo e segnala manutenzioni
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-[#1A1F26] border-white/10">
            <CardHeader className="pb-2">
              <CardDescription>Saldo Attuale</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#1FA9A0]">€1,250.00</div>
              <p className="text-xs text-muted-foreground mt-1">Prossima scadenza: 15 Feb</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1A1F26] border-white/10">
            <CardHeader className="pb-2">
              <CardDescription>Documenti</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground mt-1">Ultimo aggiornamento: oggi</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1A1F26] border-white/10">
            <CardHeader className="pb-2">
              <CardDescription>Manutenzioni Attive</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground mt-1">In attesa di risposta</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: FileText, label: 'Documenti', href: '/tenant/documents' },
            { icon: Wallet, label: 'Pagamenti', href: '/tenant/payments' },
            { icon: Wrench, label: 'Manutenzioni', href: '/tenant/maintenance' },
            { icon: MessageSquare, label: 'Messaggi', href: '/tenant/messages' },
          ].map((action, idx) => (
            <Link key={idx} href={action.href}>
              <Card className="bg-[#1A1F26] border-white/10 hover:border-[#1FA9A0]/60 transition cursor-pointer">
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <action.icon className="h-8 w-8 text-[#1FA9A0] mb-2" />
                  <p className="text-sm font-medium">{action.label}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CardDocuments />
          <Card className="bg-[#1A1F26] border-white/10">
            <CardHeader>
              <CardTitle>Prossime Scadenze</CardTitle>
              <CardDescription>Pagamenti e appuntamenti</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { title: 'Quota condominiale', amount: '€250', due: '15 Feb 2024' },
                  { title: 'Assemblea condominiale', amount: '', due: '20 Feb 2024' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-[#0E141B] rounded-lg border border-white/5">
                    <div>
                      <p className="font-medium text-sm">{item.title}</p>
                      {item.amount && <p className="text-xs text-muted-foreground">{item.amount}</p>}
                    </div>
                    <p className="text-xs text-muted-foreground">{item.due}</p>
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
