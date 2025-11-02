'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function AdminCommunications() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Comunicazioni</h1>
        <p className="text-muted-foreground">Messaggi e richieste da condòmini e fornitori</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-[#1A1F26] border-white/10">
            <CardHeader>
              <CardTitle>Messaggi Recenti</CardTitle>
              <CardDescription>Conversazioni attive</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { from: 'Mario Rossi', role: 'Condòmino', message: 'Quando sarà disponibile il verbale dell\'assemblea?', time: '2h fa', status: 'non_letta' },
                  { from: 'Pulizie SRL', role: 'Fornitore', message: 'Richiesta pagamento fattura #1234', time: '5h fa', status: 'letta' },
                ].map((msg, idx) => (
                  <div key={idx} className="p-4 bg-[#0E141B] rounded-lg border border-white/5 hover:border-[#1FA9A0]/30 transition">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{msg.from}</h4>
                        <p className="text-xs text-muted-foreground">{msg.role} • {msg.time}</p>
                      </div>
                      {msg.status === 'non_letta' && (
                        <Badge className="bg-[#1FA9A0]/20 text-[#1FA9A0]">Nuova</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-300 mt-2">{msg.message}</p>
                    <Button size="sm" variant="outline" className="mt-3">Rispondi</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-[#1A1F26] border-white/10">
          <CardHeader>
            <CardTitle>Nuovo Messaggio</CardTitle>
            <CardDescription>Invia comunicazione</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Destinatario</label>
                <select className="w-full px-3 py-2 bg-[#0E141B] border border-white/10 rounded-lg text-sm">
                  <option>Seleziona...</option>
                  <option>Condòmino</option>
                  <option>Fornitore</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Messaggio</label>
                <textarea
                  rows={6}
                  className="w-full px-3 py-2 bg-[#0E141B] border border-white/10 rounded-lg text-sm"
                  placeholder="Scrivi il messaggio..."
                />
              </div>
              <Button className="w-full bg-[#1FA9A0] hover:bg-[#17978E]">
                <Send className="h-4 w-4 mr-2" />
                Invia
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
