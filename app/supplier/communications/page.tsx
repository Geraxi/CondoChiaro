'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, Send, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function SupplierCommunications() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Comunicazioni e Richieste</h1>
        <p className="text-muted-foreground">Invia richieste all'amministratore</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-[#1A1F26] border-white/10 mb-6">
            <CardHeader>
              <CardTitle>Richieste Inviate</CardTitle>
              <CardDescription>Le tue richieste agli amministratori</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { type: 'Promemoria Pagamento', message: 'Fattura INV-002 in attesa di pagamento', date: '2 giorni fa', status: 'aperto' },
                  { type: 'Aggiornamento Lavoro', message: 'Lavoro WO-001 completato', date: '5 giorni fa', status: 'chiuso' },
                ].map((req, idx) => (
                  <div key={idx} className="p-4 bg-[#0E141B] rounded-lg border border-white/5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{req.type}</h4>
                        <p className="text-sm text-muted-foreground">{req.date}</p>
                      </div>
                      <Badge className={req.status === 'aperto' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}>
                        {req.status === 'aperto' ? 'Aperto' : 'Chiuso'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-300 mt-2">{req.message}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1A1F26] border-white/10">
            <CardHeader>
              <CardTitle>Messaggi Ricevuti</CardTitle>
              <CardDescription>Risposte dagli amministratori</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { from: 'Amministratore', message: 'Pagamento fattura INV-002 confermato per il 25/01', date: '1 giorno fa', status: 'non_letta' },
                ].map((msg, idx) => (
                  <div key={idx} className="p-4 bg-[#0E141B] rounded-lg border border-white/5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{msg.from}</h4>
                        <p className="text-sm text-muted-foreground">{msg.date}</p>
                      </div>
                      {msg.status === 'non_letta' && (
                        <Badge className="bg-[#1FA9A0]/20 text-[#1FA9A0]">Nuova</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-300 mt-2">{msg.message}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-[#1A1F26] border-white/10">
          <CardHeader>
            <CardTitle>Nuova Richiesta</CardTitle>
            <CardDescription>Invia richiesta all'amministratore</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Tipo Richiesta</label>
                <select className="w-full px-3 py-2 bg-[#0E141B] border border-white/10 rounded-lg text-sm">
                  <option>Promemoria Pagamento</option>
                  <option>Aggiornamento Lavoro</option>
                  <option>Invio Preventivo</option>
                  <option>Altro</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Messaggio</label>
                <textarea
                  rows={6}
                  className="w-full px-3 py-2 bg-[#0E141B] border border-white/10 rounded-lg text-sm"
                  placeholder="Descrivi la tua richiesta..."
                />
              </div>
              <Button className="w-full bg-[#1FA9A0] hover:bg-[#17978E]">
                <Send className="h-4 w-4 mr-2" />
                Invia Richiesta
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
