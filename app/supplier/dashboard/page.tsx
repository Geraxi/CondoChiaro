'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import {
  maintenanceTickets,
  supplierInvoices,
  supplierPerformance,
  workOrders,
} from '@/lib/data/maintenance'

const activeTickets = maintenanceTickets.length
const completedOrders = workOrders.filter((order) => order.status === 'completato').length
const inProgressOrders = workOrders.filter((order) => order.status === 'in_lavoro')
const pendingInvoicesTotal = supplierInvoices
  .filter((invoice) => invoice.status !== 'pagato')
  .reduce((total, invoice) => total + invoice.amount, 0)

export default function SupplierDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard Fornitore</h1>
          <p className="text-muted-foreground">
            Gestisci ticket, ordini di lavoro e fatture
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Ticket Attivi', value: String(activeTickets), color: 'text-[#1FA9A0]' },
            { label: 'Ordini Completati', value: String(completedOrders), color: 'text-green-400' },
            { label: 'Fatture Pendenti', value: `€${pendingInvoicesTotal.toLocaleString('it-IT')}`, color: 'text-yellow-400' },
            { label: 'Ordini in Lavorazione', value: String(inProgressOrders.length), color: 'text-blue-400' },
          ].map((stat, idx) => (
            <Card key={idx} className="bg-[#1A1F26] border-white/10">
              <CardHeader className="pb-2">
                <CardDescription>{stat.label}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="bg-[#1A1F26] border-white/10">
            <CardHeader>
              <CardTitle>Performance Mensile</CardTitle>
              <CardDescription>Ordini completati e in lavorazione</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={supplierPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A3441" />
                  <XAxis dataKey="month" stroke="#A1A8B3" />
                  <YAxis stroke="#A1A8B3" />
                  <Tooltip contentStyle={{ backgroundColor: '#1A1F26', border: '1px solid #2A3441' }} />
                  <Legend />
                  <Bar dataKey="completati" fill="#1FA9A0" />
                  <Bar dataKey="in_lavoro" fill="#F59E0B" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-[#1A1F26] border-white/10">
            <CardHeader>
              <CardTitle>Storico Pagamenti</CardTitle>
              <CardDescription>Fatture e pagamenti recenti</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {supplierInvoices.map((payment) => (
                  <div key={payment.invoice} className="flex items-center justify-between p-3 bg-[#0E141B] rounded-lg border border-white/5">
                    <div>
                      <p className="font-medium text-sm">{payment.invoice}</p>
                      <p className="text-xs text-muted-foreground">{payment.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">€{payment.amount}</p>
                      <span className={`text-xs ${payment.status === 'pagato' ? 'text-green-400' : 'text-yellow-400'}`}>
                        {payment.status === 'pagato' ? 'Pagato' : 'In attesa'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ticket List */}
        <Card className="bg-[#1A1F26] border-white/10">
          <CardHeader>
            <CardTitle>Ticket Assegnati</CardTitle>
            <CardDescription>Lavori in corso e da iniziare</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {workOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-[#0E141B] rounded-lg border border-white/5">
                  <div>
                    <p className="font-medium">{order.id} - {order.title}</p>
                    <p className="text-sm text-muted-foreground">{order.building}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    order.status === 'in_lavoro' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                  }`}>
                    {order.status === 'in_lavoro' ? `In Lavoro (${order.progress}%)` : 'Completato'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
