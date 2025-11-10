'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ClipboardList, CheckCircle, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function DemoSupplierWorkOrders() {
  return (
    <div className="min-h-screen bg-[#0E141B]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-white">Ordini di Lavoro - Demo</h1>
          <p className="text-gray-300">Visualizzazione demo degli ordini di lavoro</p>
        </div>

        <Card className="bg-[#1A1F26] border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Ordini Assegnati</CardTitle>
            <CardDescription>Lavori da completare</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { id: 'ORD-001', title: 'Riparazione caldaia', building: 'Residenza Milano Centro', status: 'in_progress', progress: 75 },
                { id: 'ORD-002', title: 'Manutenzione ascensore', building: 'Palazzo Roma Nord', status: 'completed', progress: 100 },
                { id: 'ORD-003', title: 'Pulizia condotti', building: 'Residenza Milano Centro', status: 'pending', progress: 0 },
              ].map((order) => (
                <div key={order.id} className="p-4 bg-[#0E141B] rounded-lg border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <ClipboardList className="h-5 w-5 text-[#1FA9A0]" />
                      <div>
                        <p className="font-medium text-white">{order.id} - {order.title}</p>
                        <p className="text-sm text-gray-400">{order.building}</p>
                      </div>
                    </div>
                    {order.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : order.status === 'in_progress' ? (
                      <Clock className="h-5 w-5 text-blue-400" />
                    ) : (
                      <Badge className="bg-yellow-500/20 text-yellow-400">In Attesa</Badge>
                    )}
                  </div>
                  {order.status === 'in_progress' && (
                    <div className="w-full bg-[#1A1F26] rounded-full h-2 mt-2">
                      <div 
                        className="bg-[#1FA9A0] h-2 rounded-full transition-all"
                        style={{ width: `${order.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}



