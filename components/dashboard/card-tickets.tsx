'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Wrench, TrendingUp } from 'lucide-react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { supabase } from '@/lib/supabase'

const COLORS = {
  aperto: '#FFA726',
  in_lavoro: '#42A5F5',
  chiuso: '#66BB6A',
  alta: '#FF6B6B',
  media: '#FFA726',
  bassa: '#66BB6A',
}

// Mock data for demo
const mockTickets = [
  { id: 1, title: 'Riparazione ascensore', status: 'aperto', priority: 'alta', date: '2024-01-15' },
  { id: 2, title: 'Pulizia scale', status: 'in_lavoro', priority: 'media', date: '2024-01-14' },
  { id: 3, title: 'Sostituzione lampadine', status: 'chiuso', priority: 'bassa', date: '2024-01-13' },
  { id: 4, title: 'Manutenzione caldaia', status: 'aperto', priority: 'alta', date: '2024-01-12' },
  { id: 5, title: 'Controllo impianto elettrico', status: 'in_lavoro', priority: 'media', date: '2024-01-11' },
]

export function CardTickets() {
  const [tickets, setTickets] = useState(mockTickets)
  const [ticketStats, setTicketStats] = useState<any>(null)

  useEffect(() => {
    loadTickets()
  }, [])

  const loadTickets = async () => {
    try {
      // Try to load from jobs table
      const { data, error } = await supabase
        .from('jobs')
        .select('id, title, status, priority, created_at')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      if (data && data.length > 0) {
        const formattedTickets = data.map(job => ({
          id: job.id,
          title: job.title,
          status: job.status === 'open' ? 'aperto' : job.status === 'in_progress' ? 'in_lavoro' : 'chiuso',
          priority: job.priority || 'media',
          date: job.created_at,
        }))
        setTickets(formattedTickets)
        processTicketStats(formattedTickets)
      } else {
        processTicketStats(mockTickets)
      }
    } catch (error: any) {
      console.error('Error loading tickets:', error)
      processTicketStats(mockTickets)
    }
  }

  const processTicketStats = (tickets: any[]) => {
    const statusCounts: Record<string, number> = {}
    const priorityCounts: Record<string, number> = {}

    tickets.forEach(ticket => {
      statusCounts[ticket.status] = (statusCounts[ticket.status] || 0) + 1
      priorityCounts[ticket.priority] = (priorityCounts[ticket.priority] || 0) + 1
    })

    setTicketStats({
      byStatus: Object.entries(statusCounts).map(([name, value]) => ({
        name: name === 'aperto' ? 'Aperti' : name === 'in_lavoro' ? 'In Lavoro' : 'Chiusi',
        value,
        color: COLORS[name as keyof typeof COLORS] || '#8884d8',
      })),
      byPriority: Object.entries(priorityCounts).map(([name, value]) => ({
        name: name === 'alta' ? 'Alta' : name === 'media' ? 'Media' : 'Bassa',
        value,
        color: COLORS[name as keyof typeof COLORS] || '#8884d8',
      })),
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aperto': return 'bg-yellow-500/20 text-yellow-400'
      case 'in_lavoro': return 'bg-blue-500/20 text-blue-400'
      case 'chiuso': return 'bg-green-500/20 text-green-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const stats = ticketStats || {
    byStatus: [
      { name: 'Aperti', value: 2, color: COLORS.aperto },
      { name: 'In Lavoro', value: 2, color: COLORS.in_lavoro },
      { name: 'Chiusi', value: 1, color: COLORS.chiuso },
    ],
    byPriority: [
      { name: 'Alta', value: 2, color: COLORS.alta },
      { name: 'Media', value: 2, color: COLORS.media },
      { name: 'Bassa', value: 1, color: COLORS.bassa },
    ],
  }

  return (
    <Card className="bg-[#1A1F26] border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Wrench className="h-5 w-5 text-[#1FA9A0]" />
          Ticket Manutenzione
        </CardTitle>
        <CardDescription>Ticket attivi e statistiche</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Status Distribution */}
          <div className="w-full">
            <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Distribuzione per Stato
            </h4>
            <div className="w-full" style={{ minHeight: '180px' }}>
              <ResponsiveContainer width="100%" height={180}>
              <BarChart data={stats.byStatus} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  type="number"
                  stroke="rgba(255,255,255,0.6)"
                  tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
                />
                <YAxis 
                  dataKey="name" 
                  type="category"
                  stroke="rgba(255,255,255,0.6)"
                  tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
                  width={80}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1A1F26', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {stats.byStatus.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            </div>
          </div>

          {/* Priority Pie Chart */}
          <div className="w-full">
            <h4 className="text-sm font-medium text-gray-400 mb-3">Per Priorità</h4>
            <div className="w-full" style={{ minHeight: '150px' }}>
              <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie
                  data={stats.byPriority}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }: any) => (value as number) > 0 ? `${name}: ${value}` : ''}
                  outerRadius={55}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.byPriority.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1A1F26', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Tickets List */}
          <div className="pt-4 border-t border-white/10">
            <h4 className="text-sm font-medium text-gray-400 mb-3">Ticket Recenti</h4>
            <div className="space-y-2">
              {tickets.slice(0, 3).map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-2 bg-[#0E141B] rounded-lg border border-white/5 hover:border-[#1FA9A0]/30 transition">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-white truncate mb-1">{ticket.title}</h4>
                    <p className="text-xs text-gray-400">{new Date(ticket.date).toLocaleDateString('it-IT')}</p>
                  </div>
                  <Badge className={getStatusColor(ticket.status)}>
                    {ticket.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
