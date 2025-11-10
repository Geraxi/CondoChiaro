'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Wrench, Clock, CheckCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function DemoTenantMaintenance() {
  return (
    <div className="min-h-screen bg-[#0E141B]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-white">Manutenzione - Demo</h1>
          <p className="text-gray-300">Visualizzazione demo delle segnalazioni di manutenzione</p>
        </div>

        <Card className="bg-[#1A1F26] border-white/10 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Nuova Segnalazione</CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="bg-[#1FA9A0] hover:bg-[#17978E]">
              <Wrench className="h-4 w-4 mr-2" />
              Segnala Problema
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1F26] border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Le Mie Segnalazioni</CardTitle>
            <CardDescription>Stato delle tue richieste di manutenzione</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { id: 'TKT-001', title: 'Problema ascensore', date: '10 Feb 2024', status: 'in_progress' },
                { id: 'TKT-002', title: 'Perdita acqua', date: '5 Feb 2024', status: 'completed' },
              ].map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-4 bg-[#0E141B] rounded-lg border border-white/5">
                  <div className="flex items-center gap-4">
                    <Wrench className="h-5 w-5 text-[#1FA9A0]" />
                    <div>
                      <p className="font-medium text-white">{ticket.id} - {ticket.title}</p>
                      <p className="text-sm text-gray-400">{ticket.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {ticket.status === 'completed' ? (
                      <>
                        <Badge className="bg-green-500/20 text-green-400">Completato</Badge>
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      </>
                    ) : (
                      <>
                        <Badge className="bg-blue-500/20 text-blue-400">In Lavorazione</Badge>
                        <Clock className="h-5 w-5 text-blue-400" />
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}



