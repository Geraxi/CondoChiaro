'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, Send, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DemoSupplierCommunications() {
  return (
    <div className="min-h-screen bg-[#0E141B]">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-white">Comunicazioni - Demo</h1>
          <p className="text-gray-300">Visualizzazione demo delle comunicazioni con gli amministratori</p>
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
                <label className="text-sm text-gray-300 mb-2 block">Destinatario</label>
                <select className="w-full px-4 py-2 bg-[#0E141B] border border-white/10 rounded-lg text-white">
                  <option>Amministratore - Residenza Milano Centro</option>
                  <option>Amministratore - Palazzo Roma Nord</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-300 mb-2 block">Messaggio</label>
                <textarea 
                  className="w-full px-4 py-2 bg-[#0E141B] border border-white/10 rounded-lg text-white"
                  rows={4}
                  placeholder="Scrivi il tuo messaggio..."
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
            <CardDescription>Messaggi con gli amministratori</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { from: 'Amministratore - Residenza Milano Centro', message: 'Lavoro completato perfettamente, grazie!', time: '2h fa', building: 'Residenza Milano Centro' },
                { from: 'Tu', message: 'Ho completato l\'intervento. Allego le foto.', time: '3h fa', building: 'Residenza Milano Centro' },
              ].map((msg, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 bg-[#0E141B] rounded-lg border border-white/5">
                  <MessageSquare className="h-5 w-5 text-[#1FA9A0] mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-white">{msg.from}</p>
                      <Building2 className="h-4 w-4 text-gray-400" />
                      <span className="text-xs text-gray-500">{msg.building}</span>
                    </div>
                    <p className="text-sm text-gray-300">{msg.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{msg.time}</p>
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



