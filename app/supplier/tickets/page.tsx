'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Wrench, CheckCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function SupplierTickets() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Ticket Assegnati</h1>
        <p className="text-muted-foreground">Vedi lavori assegnati e aggiorna stato</p>
      </div>

      <div className="space-y-4">
        {[
          { id: 'T-001', title: 'Riparazione ascensore', building: 'Via Roma 10', assigned: '10 Gen 2024', status: 'in_lavoro', priority: 'alta' },
          { id: 'T-002', title: 'Pulizia scale', building: 'Via Verdi 5', assigned: '8 Gen 2024', status: 'completato', priority: 'media' },
          { id: 'T-003', title: 'Manutenzione caldaia', building: 'Via Milano 3', assigned: '5 Gen 2024', status: 'in_lavoro', priority: 'alta' },
        ].map((ticket, idx) => (
          <Card key={idx} className="bg-[#1A1F26] border-white/10">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{ticket.id} - {ticket.title}</h3>
                    <Badge className={
                      ticket.priority === 'alta' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                    }>
                      {ticket.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Edificio: {ticket.building} • Assegnato: {ticket.assigned}</p>
                </div>
                <Badge className={
                  ticket.status === 'completato' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                }>
                  {ticket.status === 'completato' ? 'Completato' : 'In Lavoro'}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">Visualizza Dettagli</Button>
                {ticket.status !== 'completato' && (
                  <Button size="sm" className="bg-[#1FA9A0] hover:bg-[#17978E]">Aggiorna Stato</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
