'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Wrench, AlertTriangle, Clock, CheckCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function DemoAdminMaintenance() {
  return (
    <div className="min-h-screen bg-[#0E141B]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-white">Manutenzione - Demo</h1>
          <p className="text-gray-300">Visualizzazione demo dei ticket di manutenzione</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-[#1A1F26] border-white/10">
            <CardHeader>
              <CardDescription>Ticket Aperti</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-400">3</div>
            </CardContent>
          </Card>
          <Card className="bg-[#1A1F26] border-white/10">
            <CardHeader>
              <CardDescription>In Lavorazione</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400">5</div>
            </CardContent>
          </Card>
          <Card className="bg-[#1A1F26] border-white/10">
            <CardHeader>
              <CardDescription>Completati</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">12</div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-[#1A1F26] border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Ticket Recenti</CardTitle>
            <CardDescription>Ultimi interventi richiesti</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { id: 'TKT-001', title: 'Riparazione ascensore', building: 'Residenza Milano Centro', status: 'open', priority: 'alta', days: 2 },
                { id: 'TKT-002', title: 'Manutenzione caldaia', building: 'Palazzo Roma Nord', status: 'in_progress', priority: 'media', days: 5 },
                { id: 'TKT-003', title: 'Pulizia condotti', building: 'Residenza Milano Centro', status: 'completed', priority: 'bassa', days: 0 },
              ].map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-4 bg-[#0E141B] rounded-lg border border-white/5">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Wrench className="h-5 w-5 text-[#1FA9A0]" />
                      <p className="font-medium text-white">{ticket.id} - {ticket.title}</p>
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
                    <p className="text-sm text-gray-400">{ticket.building}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {ticket.status === 'open' && ticket.days > 7 && (
                      <AlertTriangle className="h-5 w-5 text-yellow-400" />
                    )}
                    {ticket.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : ticket.status === 'in_progress' ? (
                      <Clock className="h-5 w-5 text-blue-400" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-400" />
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

