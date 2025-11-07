'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const tickets = [
  { id: 1, title: 'Riparazione ascensore', status: 'aperto', priority: 'alta', date: '2024-01-15' },
  { id: 2, title: 'Pulizia scale', status: 'in_lavoro', priority: 'media', date: '2024-01-14' },
  { id: 3, title: 'Sostituzione lampadine', status: 'chiuso', priority: 'bassa', date: '2024-01-13' },
]

export function CardTickets() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aperto': return 'bg-yellow-500/20 text-yellow-400'
      case 'in_lavoro': return 'bg-blue-500/20 text-blue-400'
      case 'chiuso': return 'bg-green-500/20 text-green-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ticket Manutenzione</CardTitle>
        <CardDescription>Ticket attivi e in lavorazione</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="flex items-center justify-between p-4 bg-[#0E141B] rounded-lg border border-white/5">
              <div>
                <h4 className="font-semibold mb-1 text-white">{ticket.title}</h4>
                <p className="text-sm text-gray-400">{ticket.date}</p>
              </div>
              <div className="flex gap-2">
                <Badge className={getStatusColor(ticket.status)}>
                  {ticket.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
