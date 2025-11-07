'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ClipboardList, CheckCircle, Clock, X, MessageSquare, FileText, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Job {
  id: string
  title: string
  description: string | null
  priority: 'bassa' | 'media' | 'alta'
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'closed' | 'cancelled'
  scheduled_at: string | null
  amount_est: number | null
  amount_final: number | null
  created_at: string
  condominiums: {
    id: string
    name: string
    address: string | null
  } | null
  admins: {
    id: string
    name: string | null
    email: string | null
  } | null
}

export default function SupplierWorkOrders() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    loadJobs()
  }, [statusFilter])

  const loadJobs = async () => {
    setLoading(true)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        toast.error('Sessione scaduta')
        setLoading(false)
        return
      }

      const params = new URLSearchParams()
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }

      const response = await fetch(`/api/jobs/my-jobs?${params}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        setJobs(result.data || [])
      } else {
        toast.error(result.error || 'Errore nel caricamento ordini')
      }
    } catch (error: any) {
      console.error('Load jobs error:', error)
      toast.error('Errore nel caricamento ordini di lavoro')
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptJob = async (jobId: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        toast.error('Sessione scaduta')
        return
      }

      const response = await fetch(`/api/jobs/${jobId}/accept`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Ordine accettato con successo')
        loadJobs()
      } else {
        toast.error(result.error || 'Errore nell\'accettazione')
      }
    } catch (error: any) {
      console.error('Accept job error:', error)
      toast.error('Errore nell\'accettazione ordine')
    }
  }

  const handleRejectJob = async (jobId: string) => {
    if (!confirm('Sei sicuro di voler rifiutare questo ordine?')) {
      return
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        toast.error('Sessione scaduta')
        return
      }

      const response = await fetch(`/api/jobs/${jobId}/reject`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Ordine rifiutato')
        loadJobs()
      } else {
        toast.error(result.error || 'Errore nel rifiuto')
      }
    } catch (error: any) {
      console.error('Reject job error:', error)
      toast.error('Errore nel rifiuto ordine')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      pending: { label: 'In Attesa', className: 'bg-yellow-500/20 text-yellow-400' },
      accepted: { label: 'Accettato', className: 'bg-blue-500/20 text-blue-400' },
      in_progress: { label: 'In Lavoro', className: 'bg-purple-500/20 text-purple-400' },
      completed: { label: 'Completato', className: 'bg-green-500/20 text-green-400' },
      closed: { label: 'Chiuso', className: 'bg-gray-500/20 text-gray-400' },
      cancelled: { label: 'Annullato', className: 'bg-red-500/20 text-red-400' },
    }

    const statusInfo = statusMap[status] || { label: status, className: 'bg-gray-500/20 text-gray-400' }
    return <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
  }

  const getPriorityBadge = (priority: string) => {
    const priorityMap: Record<string, { label: string; className: string }> = {
      alta: { label: 'Alta', className: 'bg-red-500/20 text-red-400' },
      media: { label: 'Media', className: 'bg-yellow-500/20 text-yellow-400' },
      bassa: { label: 'Bassa', className: 'bg-green-500/20 text-green-400' },
    }

    const priorityInfo = priorityMap[priority] || { label: priority, className: 'bg-gray-500/20 text-gray-400' }
    return <Badge className={priorityInfo.className}>{priorityInfo.label}</Badge>
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1FA9A0] mx-auto"></div>
          <p className="mt-4 text-gray-400">Caricamento ordini...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-white">Ordini di Lavoro</h1>
        <p className="text-gray-300">Gestisci gli ordini assegnati dagli amministratori</p>
      </div>

      {/* Status Filter */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {['all', 'pending', 'accepted', 'in_progress', 'completed'].map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? 'default' : 'outline'}
            onClick={() => setStatusFilter(status)}
            className={statusFilter === status ? 'bg-[#1FA9A0] hover:bg-[#17978E]' : ''}
          >
            {status === 'all' ? 'Tutti' : status === 'pending' ? 'In Attesa' : status === 'accepted' ? 'Accettati' : status === 'in_progress' ? 'In Lavoro' : 'Completati'}
          </Button>
        ))}
      </div>

      {jobs.length === 0 ? (
        <Card className="bg-[#1A1F26] border-white/10">
          <CardContent className="py-12 text-center">
            <ClipboardList className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">Nessun ordine trovato</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <Card key={job.id} className="bg-[#1A1F26] border-white/10">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 text-white">
                      <ClipboardList className="h-5 w-5 text-[#1FA9A0]" />
                      {job.title}
                    </CardTitle>
                    <CardDescription className="text-gray-400 mt-1">
                      {job.condominiums?.name || 'Condominio'} • {job.condominiums?.address || 'Indirizzo non disponibile'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {job.description && (
                    <p className="text-sm text-gray-300">{job.description}</p>
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    {getStatusBadge(job.status)}
                    {getPriorityBadge(job.priority)}
                  </div>

                  <div className="space-y-2 text-sm">
                    {job.scheduled_at && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Programmato:</span>
                        <span className="text-white font-medium">
                          {new Date(job.scheduled_at).toLocaleDateString('it-IT', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    )}
                    {job.amount_est && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Importo stimato:</span>
                        <span className="text-white font-semibold">€{job.amount_est.toLocaleString('it-IT')}</span>
                      </div>
                    )}
                    {job.amount_final && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Importo finale:</span>
                        <span className="text-white font-semibold">€{job.amount_final.toLocaleString('it-IT')}</span>
                      </div>
                    )}
                    {job.admins && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Amministratore:</span>
                        <span className="text-white">{job.admins.name || job.admins.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-white/10 flex gap-2">
                    {job.status === 'pending' && (
                      <>
                        <Button
                          onClick={() => handleAcceptJob(job.id)}
                          className="flex-1 bg-[#1FA9A0] hover:bg-[#17978E]"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Accetta
                        </Button>
                        <Button
                          onClick={() => handleRejectJob(job.id)}
                          variant="outline"
                          className="flex-1"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Rifiuta
                        </Button>
                      </>
                    )}
                    {job.status === 'accepted' && (
                      <Button
                        onClick={() => {
                          // Navigate to job detail or open quote dialog
                          toast.info('Funzionalità in sviluppo')
                        }}
                        className="flex-1 bg-[#1FA9A0] hover:bg-[#17978E]"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Invia Preventivo
                      </Button>
                    )}
                    {['accepted', 'in_progress'].includes(job.status) && (
                      <Link href={`/supplier/workorders/${job.id}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Dettagli
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
