'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Wrench, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function AdminMaintenance() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Manutenzioni</h1>
        <p className="text-muted-foreground">Approvazione ticket e ordini di lavoro</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#1A1F26] border-white/10">
          <CardHeader>
            <CardTitle>Ticket Aperti</CardTitle>
            <CardDescription>Ticket in attesa di approvazione</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { id: 'T-001', title: 'Riparazione ascensore', from: 'Mario Rossi', priority: 'alta', date: '2 giorni fa' },
                { id: 'T-002', title: 'Sostituzione lampadine', from: 'Luisa Bianchi', priority: 'media', date: '5 giorni fa' },
              ].map((ticket, idx) => (
                <div key={idx} className="p-4 bg-[#0E141B] rounded-lg border border-white/5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{ticket.id} - {ticket.title}</h4>
                      <p className="text-sm text-muted-foreground">Da: {ticket.from} • {ticket.date}</p>
                    </div>
                    <Badge className={ticket.priority === 'alta' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}>
                      {ticket.priority}
                    </Badge>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" className="bg-[#1FA9A0] hover:bg-[#17978E]">Approva</Button>
                    <Button size="sm" variant="outline">Rifiuta</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1F26] border-white/10">
          <CardHeader>
            <CardTitle>Ordini di Lavoro</CardTitle>
            <CardDescription>Lavori approvati e in corso</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { id: 'WO-001', title: 'Pulizia scale', supplier: 'Pulizie SRL', status: 'in_lavoro', progress: '60%' },
                { id: 'WO-002', title: 'Manutenzione caldaia', supplier: 'Tecno Service', status: 'completato', progress: '100%' },
              ].map((work, idx) => (
                <div key={idx} className="p-4 bg-[#0E141B] rounded-lg border border-white/5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{work.id} - {work.title}</h4>
                      <p className="text-sm text-muted-foreground">{work.supplier}</p>
                    </div>
                    <Badge className={
                      work.status === 'completato' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                    }>
                      {work.status === 'completato' ? 'Completato' : 'In Lavoro'}
                    </Badge>
                  </div>
                  {work.status === 'in_lavoro' && (
                    <div className="mt-3">
                      <div className="h-2 bg-[#0E141B] rounded-full overflow-hidden">
                        <div className="h-full bg-[#1FA9A0] rounded-full" style={{ width: work.progress }}></div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Progresso: {work.progress}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
