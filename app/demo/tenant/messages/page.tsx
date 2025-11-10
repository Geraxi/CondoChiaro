'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DemoTenantMessages() {
  return (
    <div className="min-h-screen bg-[#0E141B]">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-white">Messaggi - Demo</h1>
          <p className="text-gray-300">Visualizzazione demo dei messaggi con l'amministratore</p>
        </div>

        <Card className="bg-[#1A1F26] border-white/10 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Send className="h-6 w-6 text-[#1FA9A0]" />
              Nuovo Messaggio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-300 mb-2 block">Messaggio</label>
                <textarea 
                  className="w-full px-4 py-2 bg-[#0E141B] border border-white/10 rounded-lg text-white"
                  rows={4}
                  placeholder="Scrivi il tuo messaggio all'amministratore..."
                />
              </div>
              <Button className="bg-[#1FA9A0] hover:bg-[#17978E]">
                Invia Messaggio
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1F26] border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Conversazioni</CardTitle>
            <CardDescription>Messaggi scambiati con l'amministratore</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { from: 'Amministratore', message: 'Il pagamento è stato ricevuto. Grazie!', time: '2h fa', sent: false },
                { from: 'Tu', message: 'Ho effettuato il pagamento via bonifico', time: '3h fa', sent: true },
                { from: 'Amministratore', message: 'Assemblea confermata per il 20 Febbraio', time: '1d fa', sent: false },
              ].map((msg, idx) => (
                <div key={idx} className={`flex items-start gap-3 p-4 bg-[#0E141B] rounded-lg border border-white/5 ${msg.sent ? 'border-[#1FA9A0]/30' : ''}`}>
                  <MessageSquare className={`h-5 w-5 mt-1 flex-shrink-0 ${msg.sent ? 'text-[#1FA9A0]' : 'text-gray-400'}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-white">{msg.from}</p>
                      <p className="text-xs text-gray-500">{msg.time}</p>
                    </div>
                    <p className="text-sm text-gray-300">{msg.message}</p>
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



