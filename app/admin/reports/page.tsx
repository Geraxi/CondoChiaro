'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, Download, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const monthlyRevenue = [
  { month: 'Gen', revenue: 12000 },
  { month: 'Feb', revenue: 15000 },
  { month: 'Mar', revenue: 18000 },
  { month: 'Apr', revenue: 14000 },
  { month: 'Mag', revenue: 16000 },
  { month: 'Giu', revenue: 17000 },
]

const expenseDistribution = [
  { name: 'Manutenzioni', value: 35, color: '#1FA9A0' },
  { name: 'Pulizie', value: 25, color: '#FF6B6B' },
  { name: 'Utilities', value: 20, color: '#F59E0B' },
  { name: 'Altro', value: 20, color: '#8B5CF6' },
]

export default function AdminReports() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Report e Analisi</h1>
          <p className="text-muted-foreground">Centro analisi e reportistica</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Esporta Report
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="bg-[#1A1F26] border-white/10">
          <CardHeader>
            <CardTitle>Entrate Mensili</CardTitle>
            <CardDescription>Andamento quote condominiali</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A3441" />
                <XAxis dataKey="month" stroke="#A1A8B3" />
                <YAxis stroke="#A1A8B3" />
                <Tooltip contentStyle={{ backgroundColor: '#1A1F26', border: '1px solid #2A3441' }} />
                <Line type="monotone" dataKey="revenue" stroke="#1FA9A0" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1F26] border-white/10">
          <CardHeader>
            <CardTitle>Distribuzione Spese</CardTitle>
            <CardDescription>Breakdown per categoria</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={380}>
              <PieChart>
                <Pie
                  data={expenseDistribution}
                  cx="50%"
                  cy="45%"
                  labelLine={true}
                  label={(props: any) => `${(props.percent * 100).toFixed(0)}%`}
                  outerRadius={110}
                  innerRadius={40}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={3}
                >
                  {expenseDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1A1F26', 
                    border: '1px solid #2A3441',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#F2F4F7'
                  }}
                  labelStyle={{ color: '#F2F4F7', marginBottom: '4px' }}
                  formatter={(value: number, name: string) => [`${value}%`, name]}
                />
                <Legend 
                  verticalAlign="bottom"
                  height={80}
                  iconType="square"
                  wrapperStyle={{ 
                    paddingTop: '20px', 
                    fontSize: '14px',
                    color: '#F2F4F7'
                  }}
                  iconSize={12}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#1A1F26] border-white/10">
        <CardHeader>
          <CardTitle>Report Disponibili</CardTitle>
          <CardDescription>Scarica report dettagliati</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Report Finanziario', desc: 'Entrate e uscite mensili', type: 'PDF' },
              { title: 'Report Manutenzioni', desc: 'Stato ticket e ordini', type: 'PDF' },
              { title: 'Report Pagamenti', desc: 'Situazione quote condominiali', type: 'Excel' },
            ].map((report, idx) => (
              <div key={idx} className="p-4 bg-[#0E141B] rounded-lg border border-white/5 hover:border-[#1FA9A0]/30 transition">
                <FileText className="h-8 w-8 text-[#1FA9A0] mb-2" />
                <h4 className="font-medium mb-1">{report.title}</h4>
                <p className="text-sm text-muted-foreground mb-3">{report.desc}</p>
                <Button size="sm" variant="outline" className="w-full">
                  <Download className="h-3 w-3 mr-2" />
                  Scarica {report.type}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
