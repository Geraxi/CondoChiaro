'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function CardEscalation() {
  const [escalatedCount, setEscalatedCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEscalatedTickets()
  }, [])

  const loadEscalatedTickets = async () => {
    try {
      // Count escalated jobs
      const { count: jobsCount } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('escalated', true)

      // Count escalated interventi (if table exists)
      let interventiCount = 0
      try {
        const { count } = await supabase
          .from('interventi')
          .select('*', { count: 'exact', head: true })
          .eq('escalated', true)
        interventiCount = count || 0
      } catch (e) {
        // interventi table might not exist
      }

      // Count escalated tickets (if table exists)
      let ticketsCount = 0
      try {
        const { count } = await supabase
          .from('tickets')
          .select('*', { count: 'exact', head: true })
          .eq('escalated', true)
        ticketsCount = count || 0
      } catch (e) {
        // tickets table might not exist
      }

      setEscalatedCount((jobsCount || 0) + interventiCount + ticketsCount)
    } catch (error: any) {
      console.error('Error loading escalated tickets:', error)
      setEscalatedCount(0)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-[#1A1F26] border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-400" />
          Ticket in Escalazione
        </CardTitle>
        <CardDescription>Ticket aperti da più di 7 giorni</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-4xl font-bold text-yellow-400">
              {escalatedCount ?? 0}
            </div>
            {escalatedCount && escalatedCount > 0 && (
              <Link href="/admin/maintenance?filter=escalated">
                <Button variant="outline" size="sm" className="w-full border-yellow-400/50 hover:bg-yellow-400/10">
                  Visualizza Ticket
                </Button>
              </Link>
            )}
            {escalatedCount === 0 && (
              <p className="text-sm text-gray-400">Nessun ticket in escalation</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}



