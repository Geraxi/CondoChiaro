'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, TrendingUp } from 'lucide-react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { supabase } from '@/lib/supabase'

const COLORS = ['#1FA9A0', '#FF6B6B', '#FFA726', '#66BB6A', '#42A5F5', '#8B5CF6']

// Mock data for demo
const mockDocuments = [
  { id: 1, title: 'Verbale Assemblea Gennaio', date: '2024-01-10', type: 'verbale', category: 'Assemblee' },
  { id: 2, title: 'Preventivo Manutenzione', date: '2024-01-08', type: 'preventivo', category: 'Manutenzioni' },
  { id: 3, title: 'Fattura Pulizie', date: '2024-01-05', type: 'fattura', category: 'Pulizie' },
  { id: 4, title: 'Polizza Assicurativa', date: '2024-01-03', type: 'assicurazione', category: 'Assicurazioni' },
  { id: 5, title: 'Contratto Fornitore', date: '2024-01-01', type: 'contratto', category: 'Contratti' },
]

export function CardDocuments() {
  const [documents, setDocuments] = useState(mockDocuments)
  const [documentStats, setDocumentStats] = useState<any>(null)

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error
      if (data && data.length > 0) {
        setDocuments(data)
        processDocumentStats(data)
      } else {
        processDocumentStats(mockDocuments)
      }
    } catch (error: any) {
      console.error('Error loading documents:', error)
      processDocumentStats(mockDocuments)
    }
  }

  const processDocumentStats = (docs: any[]) => {
    // Count by category
    const categoryCounts: Record<string, number> = {}
    const statusCounts: Record<string, number> = {
      active: 0,
      expired: 0,
      expiring: 0,
    }

    docs.forEach(doc => {
      const category = doc.category || doc.type || 'Altro'
      categoryCounts[category] = (categoryCounts[category] || 0) + 1

      const status = doc.validity_status || 'active'
      if (status === 'active') statusCounts.active++
      else if (status === 'expired') statusCounts.expired++
      else if (status === 'expiring' || status === 'pending_renewal') statusCounts.expiring++
    })

    setDocumentStats({
      byCategory: Object.entries(categoryCounts).map(([name, value]) => ({ name, value })),
      byStatus: [
        { name: 'Attivi', value: statusCounts.active, color: '#66BB6A' },
        { name: 'In Scadenza', value: statusCounts.expiring, color: '#FFA726' },
        { name: 'Scaduti', value: statusCounts.expired, color: '#FF6B6B' },
      ],
    })
  }

  const stats = documentStats || {
    byCategory: [
      { name: 'Assemblee', value: 2 },
      { name: 'Manutenzioni', value: 1 },
      { name: 'Pulizie', value: 1 },
      { name: 'Assicurazioni', value: 1 },
    ],
    byStatus: [
      { name: 'Attivi', value: 4, color: '#66BB6A' },
      { name: 'In Scadenza', value: 1, color: '#FFA726' },
      { name: 'Scaduti', value: 0, color: '#FF6B6B' },
    ],
  }

  return (
    <Card className="bg-[#1A1F26] border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <FileText className="h-5 w-5 text-[#1FA9A0]" />
          Documenti Recenti
        </CardTitle>
        <CardDescription>Ultimi documenti caricati e statistiche</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Document Status Pie Chart */}
          <div className="w-full">
            <h4 className="text-sm font-medium text-gray-400 mb-3">Stato Documenti</h4>
            <div className="w-full" style={{ minHeight: '200px' }}>
              <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={stats.byStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }: any) => (value as number) > 0 ? `${name}: ${value}` : ''}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.byStatus.map((entry: any, index: number) => (
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
                <Legend 
                  wrapperStyle={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}
                  iconSize={10}
                />
              </PieChart>
            </ResponsiveContainer>
            </div>
          </div>

          {/* Document Category Bar Chart */}
          <div className="w-full">
            <h4 className="text-sm font-medium text-gray-400 mb-3">Per Categoria</h4>
            <div className="w-full" style={{ minHeight: '150px' }}>
              <ResponsiveContainer width="100%" height={150}>
              <BarChart data={stats.byCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="name" 
                  stroke="rgba(255,255,255,0.6)"
                  tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.6)"
                  tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1A1F26', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="value" fill="#1FA9A0" radius={[4, 4, 0, 0]}>
                  {stats.byCategory.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Documents List */}
          <div className="pt-4 border-t border-white/10">
            <h4 className="text-sm font-medium text-gray-400 mb-3">Ultimi Documenti</h4>
            <div className="space-y-2">
              {documents.slice(0, 3).map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 p-2 bg-[#0E141B] rounded-lg border border-white/5 hover:border-[#1FA9A0]/30 transition">
                  <FileText className="h-4 w-4 text-[#1FA9A0] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-white truncate">{doc.title}</h4>
                    <p className="text-xs text-gray-400">{new Date(doc.date).toLocaleDateString('it-IT')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
