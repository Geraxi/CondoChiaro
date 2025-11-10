'use client'

import { useState, useEffect, useMemo } from 'react'
import { LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { supabase } from '@/lib/supabase'
import { TrendingUp, DollarSign } from 'lucide-react'
import dynamic from 'next/dynamic'

const FormattedNumber = dynamic(
  () => import('@/components/ui/formatted-number').then(mod => ({ default: mod.FormattedNumber })),
  { ssr: false }
)

const monthlyData = [
  { name: 'Gen', entrate: 12000, uscite: 8000 },
  { name: 'Feb', entrate: 15000, uscite: 9500 },
  { name: 'Mar', entrate: 18000, uscite: 11000 },
  { name: 'Apr', entrate: 14000, uscite: 8500 },
  { name: 'Mag', entrate: 16000, uscite: 10000 },
  { name: 'Giu', entrate: 17000, uscite: 10500 },
]

const expenseData = [
  { name: 'Manutenzioni', value: 35, color: '#1FA9A0' },
  { name: 'Pulizie', value: 25, color: '#FF6B6B' },
  { name: 'Utilities', value: 20, color: '#F59E0B' },
  { name: 'Altro', value: 20, color: '#8B5CF6' },
]

export function CardFinancialOverview() {
  const [financialData, setFinancialData] = useState(monthlyData)
  const [expenseDistribution, setExpenseDistribution] = useState(expenseData)

  // Memoize calculations to ensure consistency between server and client
  const totalEntrate = useMemo(() => financialData.reduce((sum, m) => sum + m.entrate, 0), [financialData])
  const totalUscite = useMemo(() => financialData.reduce((sum, m) => sum + m.uscite, 0), [financialData])
  const saldoNetto = useMemo(() => totalEntrate - totalUscite, [totalEntrate, totalUscite])

  useEffect(() => {
    loadFinancialData()
  }, [])

  const loadFinancialData = async () => {
    try {
      // Load payments data
      const { data: payments } = await supabase
        .from('payments')
        .select('amount, created_at, status')
        .eq('status', 'succeeded')
        .order('created_at', { ascending: false })
        .limit(50)

      if (payments && payments.length > 0) {
        // Process monthly data
        const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']
        const monthly: Record<string, { entrate: number; uscite: number }> = {}
        
        months.forEach(m => {
          monthly[m] = { entrate: 0, uscite: 0 }
        })

        payments.forEach(payment => {
          if (payment.created_at) {
            const date = new Date(payment.created_at)
            const monthIndex = date.getMonth()
            if (monthIndex >= 0 && monthIndex < 12) {
              monthly[months[monthIndex]].entrate += parseFloat(payment.amount || 0)
              monthly[months[monthIndex]].uscite += parseFloat(payment.amount || 0) * 0.3 // Mock expenses
            }
          }
        })

        setFinancialData(months.map(m => ({
          name: m,
          entrate: Math.round(monthly[m].entrate),
          uscite: Math.round(monthly[m].uscite),
        })))
      }
    } catch (error: any) {
      console.error('Error loading financial data:', error)
    }
  }

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
    <div className="bg-[#1A1F26] rounded-2xl p-6 border border-white/10">
      <div className="flex items-center gap-2 mb-6">
        <DollarSign className="h-6 w-6 text-[#1FA9A0]" />
        <h3 className="text-xl font-semibold text-white">Overview Finanziaria</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Area Chart with Gradient */}
        <div className="w-full">
          <h4 className="text-sm text-gray-400 mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Entrate/Uscite Mensili
          </h4>
          <div className="w-full" style={{ minHeight: '280px' }}>
            <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={financialData}>
              <defs>
                <linearGradient id="colorEntrate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1FA9A0" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#1FA9A0" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorUscite" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF6B6B" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#FF6B6B" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="name" 
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
                dataKey="entrate" 
                stroke="#1FA9A0" 
                fillOpacity={1} 
                fill="url(#colorEntrate)"
                name="Entrate"
              />
              <Area 
                type="monotone" 
                dataKey="uscite" 
                stroke="#FF6B6B" 
                fillOpacity={1} 
                fill="url(#colorUscite)"
                name="Uscite"
              />
            </AreaChart>
          </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="w-full">
          <h4 className="text-sm text-gray-400 mb-4">Distribuzione Spese</h4>
          <div className="w-full" style={{ minHeight: '280px' }}>
            <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={expenseDistribution}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={(props: any) => `${(props.percent * 100).toFixed(0)}%`}
                outerRadius={95}
                innerRadius={35}
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
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  padding: '8px 12px'
                }}
                labelStyle={{ color: '#F2F4F7', marginBottom: '4px' }}
                itemStyle={{ color: '#F2F4F7' }}
                formatter={(value: number, name: string) => [`${value}%`, name]}
              />
              <Legend 
                verticalAlign="bottom"
                height={80}
                iconType="square"
                wrapperStyle={{ 
                  paddingTop: '20px', 
                  fontSize: '13px',
                  color: '#F2F4F7'
                }}
                iconSize={12}
              />
            </PieChart>
          </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-1">Totale Entrate</p>
          <p className="text-lg font-bold text-[#1FA9A0]" suppressHydrationWarning>
            <FormattedNumber 
              value={totalEntrate} 
              prefix="€"
              className="text-[#1FA9A0]"
            />
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-1">Totale Uscite</p>
          <p className="text-lg font-bold text-[#FF6B6B]" suppressHydrationWarning>
            <FormattedNumber 
              value={totalUscite} 
              prefix="€"
              className="text-[#FF6B6B]"
            />
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-1">Saldo Netto</p>
          <p className="text-lg font-bold text-white" suppressHydrationWarning>
            <FormattedNumber 
              value={saldoNetto} 
              prefix="€"
              className="text-white"
            />
          </p>
        </div>
      </div>
    </div>
  )
}
