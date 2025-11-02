'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Wrench, Upload, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function TenantMaintenance() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Manutenzioni</h1>
          <p className="text-muted-foreground">Segnala manutenzioni con foto</p>
        </div>
        <Button className="bg-[#1FA9A0] hover:bg-[#17978E]">
          <Upload className="h-4 w-4 mr-2" />
          Nuova Segnalazione
        </Button>
      </div>

      <Card className="bg-[#1A1F26] border-white/10 mb-6">
        <CardHeader>
          <CardTitle>Nuova Segnalazione</CardTitle>
          <CardDescription>Invia una richiesta di manutenzione</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Titolo</label>
              <input
                type="text"
                placeholder="Es. Rottura ascensore"
                className="w-full px-3 py-2 bg-[#0E141B] border border-white/10 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Descrizione</label>
              <textarea
                rows={4}
                placeholder="Descrivi il problema in dettaglio..."
                className="w-full px-3 py-2 bg-[#0E141B] border border-white/10 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Foto</label>
              <Button variant="outline" className="w-full">
                <Camera className="h-4 w-4 mr-2" />
                Carica Foto
              </Button>
            </div>
            <Button className="w-full bg-[#1FA9A0] hover:bg-[#17978E]">Invia Segnalazione</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1A1F26] border-white/10">
        <CardHeader>
          <CardTitle>Le Mie Segnalazioni</CardTitle>
          <CardDescription>Storico richieste di manutenzione</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { id: 'T-001', title: 'Riparazione ascensore', date: '10 Gen 2024', status: 'in_lavoro' },
              { id: 'T-002', title: 'Sostituzione lampadine', date: '5 Gen 2024', status: 'completato' },
            ].map((ticket, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-[#0E141B] rounded-lg border border-white/5">
                <div>
                  <h4 className="font-medium">{ticket.id} - {ticket.title}</h4>
                  <p className="text-sm text-muted-foreground">Inviata: {ticket.date}</p>
                </div>
                <Badge className={
                  ticket.status === 'completato' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                }>
                  {ticket.status === 'completato' ? 'Completato' : 'In Lavoro'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
