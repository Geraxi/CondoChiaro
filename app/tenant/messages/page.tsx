'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function TenantMessages() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Messaggi</h1>
        <p className="text-muted-foreground">Comunicazioni e notifiche</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-[#1A1F26] border-white/10">
            <CardHeader>
              <CardTitle>Conversazioni</CardTitle>
              <CardDescription>Messaggi con l'amministratore</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { from: 'Amministratore', message: 'Il verbale dell\'assemblea è disponibile', time: '2h fa', status: 'non_letta' },
                  { from: 'Amministratore', message: 'Promemoria: scadenza quota condominiale il 15/02', time: '1 giorno fa', status: 'letta' },
                ].map((msg, idx) => (
                  <div key={idx} className="p-4 bg-[#0E141B] rounded-lg border border-white/5 hover:border-[#1FA9A0]/30 transition">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{msg.from}</h4>
                        <p className="text-xs text-muted-foreground">{msg.time}</p>
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
            <CardTitle>Nuovo Messaggio</CardTitle>
            <CardDescription>Invia messaggio all'amministratore</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
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
