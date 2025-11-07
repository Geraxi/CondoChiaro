'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ResponsiveContainer, BarChart, Bar, XAxis, CartesianGrid, Tooltip } from 'recharts'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

type AnalyticsResponse = {
  totalCondominiums: number
  subscriptionMRR: number
  paymentFeeRevenue: number
  supplierRevenue: number
  netMonthlyProfit: number
}

const currencyFormatter = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
})

export function AnalyticsOverview() {
  const [data, setData] = useState<AnalyticsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/analytics/overview', { 
        cache: 'no-store',
        credentials: 'include', // Include cookies for auth
      })
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      }
      
      const text = await res.text()
      let payload: any
      
      try {
        payload = JSON.parse(text)
      } catch (parseError) {
        console.error('JSON parse error:', parseError, 'Response text:', text)
        throw new Error('Invalid JSON response from server')
      }

      if (!payload || typeof payload !== 'object') {
        throw new Error('Invalid response format')
      }

      if (!payload.success) {
        throw new Error(payload?.message ?? 'Errore durante il caricamento')
      }

      if (!payload.data || typeof payload.data !== 'object') {
        throw new Error('Invalid data in response')
      }

      setData(payload.data as AnalyticsResponse)
    } catch (err: any) {
      console.error('Analytics fetch error:', err)
      setError(err.message ?? 'Impossibile caricare i dati')
      // Set default empty data on error so UI doesn't stay in loading state
      setData({
        totalCondominiums: 0,
        subscriptionMRR: 0,
        paymentFeeRevenue: 0,
        supplierRevenue: 0,
        netMonthlyProfit: 0,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  const chartData = useMemo(() => {
    if (!data) return []
    return [
      { label: 'Abbonamenti', value: data.subscriptionMRR },
      { label: 'Commissioni Pagamenti', value: data.paymentFeeRevenue },
      { label: 'Supplier Pro', value: data.supplierRevenue },
    ]
  }, [data])

  const handleRecalculate = async () => {
    try {
      setSyncing(true)
      const response = await fetch('/api/billing/subscription/recalculate', {
        method: 'POST',
      })
      const payload = await response.json()
      if (!response.ok || !payload.success) {
        throw new Error(payload?.message ?? 'Errore nel ricalcolo')
      }
      toast.success('Abbonamento aggiornato con successo')
      await fetchAnalytics()
    } catch (err: any) {
      console.error(err)
      toast.error(err?.message ?? 'Impossibile aggiornare l’abbonamento')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 border border-white/10 bg-white/[0.02] backdrop-blur">
        <CardHeader className="pb-2">
          <CardTitle>Andamento Ricavi</CardTitle>
          <CardDescription>Ripartizione mensile per fonte di entrata</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-gray-400">Caricamento...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-red-400">Errore nel recupero dei dati: {error}</p>
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-gray-400">Nessun dato disponibile.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="label" stroke="rgba(255,255,255,0.6)" />
                <Tooltip
                  formatter={(value: number) => currencyFormatter.format(value)}
                  labelStyle={{ color: '#fff' }}
                  contentStyle={{ backgroundColor: '#0E141B', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)' }}
                />
                <Bar dataKey="value" fill="#1FA9A0" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <MetricCard
          label="Condomini attivi"
          value={data?.totalCondominiums ?? 0}
          loading={loading}
          formatter={(value) => `${value}`}
        />
        <MetricCard
          label="MRR abbonamenti"
          value={data?.subscriptionMRR ?? 0}
          loading={loading}
          formatter={currencyFormatter.format.bind(currencyFormatter)}
        />
        <MetricCard
          label="Ricavi commissioni"
          value={data?.paymentFeeRevenue ?? 0}
          loading={loading}
          formatter={currencyFormatter.format.bind(currencyFormatter)}
        />
        <MetricCard
          label="Ricavi Supplier Pro"
          value={data?.supplierRevenue ?? 0}
          loading={loading}
          formatter={currencyFormatter.format.bind(currencyFormatter)}
        />
        <MetricCard
          label="Profitto mensile netto"
          value={data?.netMonthlyProfit ?? 0}
          loading={loading}
          formatter={currencyFormatter.format.bind(currencyFormatter)}
          highlight
        />
        <Button
          variant="outline"
          size="sm"
          className="w-full bg-white/5 border-white/10 hover:bg-white/10"
          onClick={handleRecalculate}
          disabled={syncing}
        >
          {syncing ? 'Ricalcolo in corso...' : 'Ricalcola abbonamento'}
        </Button>
      </div>
    </div>
  )
}

function MetricCard({
  label,
  value,
  loading,
  formatter,
  highlight,
}: {
  label: string
  value: number
  loading: boolean
  formatter: (value: number) => string
  highlight?: boolean
}) {
  return (
    <Card
      className={cn(
        'border border-white/10 bg-white/[0.02] backdrop-blur',
        highlight && 'border-[#1FA9A0]/40 shadow-[0_0_30px_rgba(31,169,160,0.15)]'
      )}
    >
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold text-white">
          {loading ? '...' : formatter(value)}
        </div>
      </CardContent>
    </Card>
  )
}
