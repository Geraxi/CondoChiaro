'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Wrench, Clock, CheckCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function DemoSupplierTickets() {
  return (
    <div className="min-h-screen bg-[#0E141B]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-white">Ticket Assegnati - Demo</h1>
          <p className="text-gray-300">Visualizzazione demo dei ticket assegnati</p>
        </div>

        <Card className="bg-[#1A1F26] border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Ticket Attivi</CardTitle>
            <CardDescription>Lavori assegnati e in corso</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { id: 'TKT-001', title: 'Riparazione caldaia', building: 'Residenza Milano Centro', status: 'in_progress', priority: 'alta' },
                { id: 'TKT-002', title: 'Manutenzione ascensore', building: 'Palazzo Roma Nord', status: 'pending', priority: 'media' },
              ].map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-4 bg-[#0E141B] rounded-lg border border-white/5">
                  <div className="flex items-center gap-4">
                    <Wrench className="h-5 w-5 text-[#1FA9A0]" />
                    <div>
                      <p className="font-medium text-white">{ticket.id} - {ticket.title}</p>
                      <p className="text-sm text-gray-400">{ticket.building}</p>
                    </div>
                    <Badge 
                      variant="outline"
                      className={
                        ticket.priority === 'alta' ? 'bg-red-500/20 text-red-400' :
                        ticket.priority === 'media' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }
                    >
                      {ticket.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    {ticket.status === 'in_progress' ? (
                      <Clock className="h-5 w-5 text-blue-400" />
                    ) : (
                      <Badge className="bg-yellow-500/20 text-yellow-400">In Attesa</Badge>
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



