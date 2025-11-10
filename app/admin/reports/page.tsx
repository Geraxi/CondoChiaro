'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, Download, FileText, TrendingUp, DollarSign, Users, Calendar, AlertCircle, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import dynamic from 'next/dynamic'

const FormattedNumber = dynamic(
  () => import('@/components/ui/formatted-number').then(mod => ({ default: mod.FormattedNumber })),
  { ssr: false }
)
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

const COLORS = {
  primary: '#1FA9A0',
  secondary: '#17978E',
  accent: '#FF6B6B',
  warning: '#FFA726',
  success: '#66BB6A',
  info: '#42A5F5',
  purple: '#8B5CF6',
  orange: '#FF9800',
}

const CHART_COLORS = [
  COLORS.primary,
  COLORS.accent,
  COLORS.warning,
  COLORS.success,
  COLORS.info,
  COLORS.purple,
  COLORS.orange,
]

export default function AdminReports() {
  const [loading, setLoading] = useState(true)
  const [financialData, setFinancialData] = useState<any>(null)
  const [paymentData, setPaymentData] = useState<any>(null)
  const [documentData, setDocumentData] = useState<any>(null)
  const [supplierData, setSupplierData] = useState<any>(null)

  useEffect(() => {
    loadReportData()
  }, [])

  const loadReportData = async () => {
    try {
      // Load financial data
      const { data: payments } = await supabase
        .from('payments')
        .select('amount, created_at, status')
        .order('created_at', { ascending: false })
        .limit(12)

      // Load document data
      const { data: documents } = await supabase
        .from('documents')
        .select('category, validity_status, expiry_date')
        .limit(100)

      // Load supplier ratings
      const { data: suppliers } = await supabase
        .from('suppliers')
        .select('name, average_rating, total_reviews')
        .not('average_rating', 'is', null)
        .order('average_rating', { ascending: false })
        .limit(10)

      // Process monthly revenue
      const monthlyRevenue = processMonthlyData(payments || [])
      const expenseDistribution = processExpenseData(documents || [])
      const paymentStatus = processPaymentStatus(payments || [])
      const supplierPerformance = processSupplierData(suppliers || [])

      setFinancialData({
        monthlyRevenue,
        expenseDistribution,
        paymentStatus,
      })
      setDocumentData({ expenseDistribution })
      setSupplierData({ supplierPerformance })
      setPaymentData({ paymentStatus })
    } catch (error: any) {
      console.error('Error loading report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const processMonthlyData = (payments: any[]) => {
    const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']
    const data: Record<string, number> = {}
    
    months.forEach(month => {
      data[month] = 0
    })

    payments.forEach(payment => {
      if (payment.created_at) {
        const date = new Date(payment.created_at)
        const monthIndex = date.getMonth()
        if (monthIndex >= 0 && monthIndex < 12) {
          data[months[monthIndex]] += parseFloat(payment.amount || 0)
        }
      }
    })

    return months.map(month => ({
      month,
      revenue: Math.round(data[month]),
      expenses: Math.round(data[month] * 0.3), // Mock expenses
    }))
  }

  const processExpenseData = (documents: any[]) => {
    const categories: Record<string, number> = {}
    
    documents.forEach(doc => {
      const category = doc.category || 'Altro'
      categories[category] = (categories[category] || 0) + 1
    })

    const total = Object.values(categories).reduce((a, b) => a + b, 0)
    
    return Object.entries(categories).map(([name, value]) => ({
      name,
      value: Math.round((value / total) * 100),
    }))
  }

  const processPaymentStatus = (payments: any[]) => {
    const statusCounts: Record<string, number> = {
      paid: 0,
      pending: 0,
      overdue: 0,
    }

    payments.forEach(payment => {
      const status = payment.status || 'pending'
      if (statusCounts.hasOwnProperty(status)) {
        statusCounts[status]++
      }
    })

    return [
      { name: 'Pagati', value: statusCounts.paid, color: COLORS.success },
      { name: 'In Attesa', value: statusCounts.pending, color: COLORS.warning },
      { name: 'Scaduti', value: statusCounts.overdue, color: COLORS.accent },
    ]
  }

  const processSupplierData = (suppliers: any[]) => {
    return suppliers.map(supplier => ({
      name: supplier.name || 'Fornitore',
      rating: parseFloat(supplier.average_rating || 0),
      reviews: supplier.total_reviews || 0,
    }))
  }

  // Mock data for demonstration (fallback)
  const mockMonthlyRevenue = [
    { month: 'Gen', revenue: 12000, expenses: 8500 },
    { month: 'Feb', revenue: 15000, expenses: 9200 },
    { month: 'Mar', revenue: 18000, expenses: 11000 },
    { month: 'Apr', revenue: 14000, expenses: 9800 },
    { month: 'Mag', revenue: 16000, expenses: 10500 },
    { month: 'Giu', revenue: 17000, expenses: 11200 },
  ]

  const mockExpenseDistribution = [
    { name: 'Manutenzioni', value: 35 },
    { name: 'Pulizie', value: 25 },
    { name: 'Utilità', value: 20 },
    { name: 'Assicurazioni', value: 12 },
    { name: 'Altro', value: 8 },
  ]

  const mockPaymentStatus = [
    { name: 'Pagati', value: 65, color: COLORS.success },
    { name: 'In Attesa', value: 25, color: COLORS.warning },
    { name: 'Scaduti', value: 10, color: COLORS.accent },
  ]

  const mockSupplierPerformance = [
    { name: 'Idraulici Rossi', rating: 4.8, reviews: 24 },
    { name: 'Elettricisti Verdi', rating: 4.6, reviews: 18 },
    { name: 'Pulizie Professionali', rating: 4.5, reviews: 32 },
    { name: 'Manutenzione Ascensori', rating: 4.3, reviews: 15 },
    { name: 'Giardinaggio Milano', rating: 4.2, reviews: 12 },
  ]

  const monthlyData = financialData?.monthlyRevenue || mockMonthlyRevenue
  const expenseData = documentData?.expenseDistribution || mockExpenseDistribution
  const paymentStatusData = paymentData?.paymentStatus || mockPaymentStatus
  const supplierDataFinal = supplierData?.supplierPerformance || mockSupplierPerformance

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1A1F26] border border-white/20 rounded-lg p-3 shadow-lg">
          <p className="text-white font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-semibold"><FormattedNumber value={entry.value} prefix="€" /></span>
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-white">Report e Analisi</h1>
          <p className="text-gray-300">Visualizzazione completa dei dati condominiali</p>
        </div>
        <Button variant="outline" className="border-[#1FA9A0]/50 hover:bg-[#1FA9A0]/10">
          <Download className="h-4 w-4 mr-2" />
          Esporta Report
        </Button>
      </div>

      <Tabs defaultValue="financial" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6 bg-[#1A1F26]">
          <TabsTrigger value="financial" className="data-[state=active]:bg-[#1FA9A0]/20">
            <DollarSign className="h-4 w-4 mr-2" />
            Finanziari
          </TabsTrigger>
          <TabsTrigger value="payments" className="data-[state=active]:bg-[#1FA9A0]/20">
            <TrendingUp className="h-4 w-4 mr-2" />
            Pagamenti
          </TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:bg-[#1FA9A0]/20">
            <FileText className="h-4 w-4 mr-2" />
            Documenti
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="data-[state=active]:bg-[#1FA9A0]/20">
            <Star className="h-4 w-4 mr-2" />
            Fornitori
          </TabsTrigger>
        </TabsList>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Revenue & Expenses */}
            <Card className="bg-[#1A1F26] border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[#1FA9A0]" />
                  Entrate e Uscite Mensili
                </CardTitle>
                <CardDescription>Andamento finanziario nel tempo</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.accent} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={COLORS.accent} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="month" 
                      stroke="rgba(255,255,255,0.6)"
                      tick={{ fill: 'rgba(255,255,255,0.6)' }}
                    />
                    <YAxis 
                      stroke="rgba(255,255,255,0.6)"
                      tick={{ fill: 'rgba(255,255,255,0.6)' }}
                      tickFormatter={(value) => `€${value/1000}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      wrapperStyle={{ color: 'rgba(255,255,255,0.8)' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke={COLORS.primary} 
                      fillOpacity={1} 
                      fill="url(#colorRevenue)"
                      name="Entrate"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="expenses" 
                      stroke={COLORS.accent} 
                      fillOpacity={1} 
                      fill="url(#colorExpenses)"
                      name="Uscite"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Expense Distribution */}
            <Card className="bg-[#1A1F26] border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-[#1FA9A0]" />
                  Distribuzione Spese
                </CardTitle>
                <CardDescription>Ripartizione per categoria</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={expenseData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: any) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {expenseData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
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
              </CardContent>
            </Card>
          </div>

          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-[#1FA9A0]/20 to-[#1FA9A0]/5 border-[#1FA9A0]/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Entrate Totali</p>
                    <p className="text-2xl font-bold text-white">
                      <FormattedNumber 
                        value={monthlyData.reduce((sum: number, m: any) => sum + m.revenue, 0)} 
                        prefix="€"
                      />
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-[#1FA9A0]" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#FF6B6B]/20 to-[#FF6B6B]/5 border-[#FF6B6B]/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Uscite Totali</p>
                    <p className="text-2xl font-bold text-white">
                      <FormattedNumber 
                        value={monthlyData.reduce((sum: number, m: any) => sum + m.expenses, 0)} 
                        prefix="€"
                      />
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-[#FF6B6B]" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#66BB6A]/20 to-[#66BB6A]/5 border-[#66BB6A]/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Saldo Netto</p>
                    <p className="text-2xl font-bold text-white">
                      <FormattedNumber 
                        value={monthlyData.reduce((sum: number, m: any) => sum + m.revenue, 0) - 
                               monthlyData.reduce((sum: number, m: any) => sum + m.expenses, 0)} 
                        prefix="€"
                      />
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-[#66BB6A]" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#FFA726]/20 to-[#FFA726]/5 border-[#FFA726]/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Media Mensile</p>
                    <p className="text-2xl font-bold text-white">
                      <FormattedNumber 
                        value={Math.round(monthlyData.reduce((sum: number, m: any) => sum + m.revenue, 0) / monthlyData.length)} 
                        prefix="€"
                      />
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-[#FFA726]" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Status Pie Chart */}
            <Card className="bg-[#1A1F26] border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Stato Pagamenti</CardTitle>
                <CardDescription>Distribuzione per stato</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={paymentStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {paymentStatusData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Payment Trend */}
            <Card className="bg-[#1A1F26] border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Andamento Pagamenti</CardTitle>
                <CardDescription>Trend mensile</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="month" 
                      stroke="rgba(255,255,255,0.6)"
                      tick={{ fill: 'rgba(255,255,255,0.6)' }}
                    />
                    <YAxis 
                      stroke="rgba(255,255,255,0.6)"
                      tick={{ fill: 'rgba(255,255,255,0.6)' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke={COLORS.primary} 
                      strokeWidth={3}
                      dot={{ fill: COLORS.primary, r: 5 }}
                      name="Pagamenti"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card className="bg-[#1A1F26] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Distribuzione Documenti</CardTitle>
              <CardDescription>Per categoria</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={expenseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="rgba(255,255,255,0.6)"
                    tick={{ fill: 'rgba(255,255,255,0.6)' }}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.6)"
                    tick={{ fill: 'rgba(255,255,255,0.6)' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1A1F26', 
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill={COLORS.primary}
                    radius={[8, 8, 0, 0]}
                  >
                    {expenseData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Suppliers Tab */}
        <TabsContent value="suppliers" className="space-y-6">
          <Card className="bg-[#1A1F26] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Performance Fornitori</CardTitle>
              <CardDescription>Valutazioni medie e numero recensioni</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={supplierDataFinal} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    type="number"
                    domain={[0, 5]}
                    stroke="rgba(255,255,255,0.6)"
                    tick={{ fill: 'rgba(255,255,255,0.6)' }}
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category"
                    stroke="rgba(255,255,255,0.6)"
                    tick={{ fill: 'rgba(255,255,255,0.6)' }}
                    width={150}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1A1F26', 
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => `${value.toFixed(1)} ⭐`}
                  />
                  <Bar 
                    dataKey="rating" 
                    fill={COLORS.primary}
                    radius={[0, 8, 8, 0]}
                  >
                    {supplierDataFinal.map((entry: any, index: number) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={
                          entry.rating >= 4.5 ? COLORS.success :
                          entry.rating >= 4.0 ? COLORS.primary :
                          entry.rating >= 3.5 ? COLORS.warning :
                          COLORS.accent
                        } 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Export Reports Section */}
      <Card className="bg-[#1A1F26] border-white/10 mt-6">
        <CardHeader>
          <CardTitle className="text-white">Report Disponibili</CardTitle>
          <CardDescription>Scarica report dettagliati in vari formati</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { 
                title: 'Report Finanziario Completo', 
                desc: 'Entrate, uscite e bilanci mensili', 
                type: 'PDF',
                icon: DollarSign
              },
              { 
                title: 'Report Manutenzioni', 
                desc: 'Stato ticket, ordini e fornitori', 
                type: 'PDF',
                icon: AlertCircle
              },
              { 
                title: 'Report Pagamenti', 
                desc: 'Situazione quote e pagamenti per unità', 
                type: 'Excel',
                icon: TrendingUp
              },
            ].map((report, idx) => {
              const Icon = report.icon
              return (
                <div 
                  key={idx} 
                  className="p-4 bg-[#0E141B] rounded-lg border border-white/5 hover:border-[#1FA9A0]/30 transition-all hover:shadow-lg hover:shadow-[#1FA9A0]/10"
                >
                  <Icon className="h-8 w-8 text-[#1FA9A0] mb-2" />
                  <h4 className="font-medium mb-1 text-white">{report.title}</h4>
                  <p className="text-sm text-gray-400 mb-3">{report.desc}</p>
                  <Button size="sm" variant="outline" className="w-full border-[#1FA9A0]/50 hover:bg-[#1FA9A0]/10">
                    <Download className="h-3 w-3 mr-2" />
                    Scarica {report.type}
                  </Button>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
