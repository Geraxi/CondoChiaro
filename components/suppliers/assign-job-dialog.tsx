'use client'

import { useState, useEffect } from 'react'
import { X, Upload, Calendar, DollarSign, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface Supplier {
  id: string
  name: string
}

interface Condominium {
  id: string
  name: string
}

interface AssignJobDialogProps {
  supplier: Supplier
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AssignJobDialog({ supplier, open, onClose, onSuccess }: AssignJobDialogProps) {
  const [condominiums, setCondominiums] = useState<Condominium[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    condo_id: '',
    title: '',
    description: '',
    priority: 'media' as 'bassa' | 'media' | 'alta',
    scheduled_at: '',
    amount_est: '',
  })

  useEffect(() => {
    if (open) {
      loadCondominiums()
    }
  }, [open])

  const loadCondominiums = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) return

      const { data, error } = await supabase.from('condominiums').select('id, name').order('name')

      if (error) throw error
      setCondominiums(data || [])
    } catch (error: any) {
      console.error('Error loading condominiums:', error)
      toast.error('Errore nel caricamento condomini')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        toast.error('Sessione scaduta')
        return
      }

      const response = await fetch('/api/jobs/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          supplier_id: supplier.id,
          condo_id: formData.condo_id,
          title: formData.title,
          description: formData.description || undefined,
          priority: formData.priority,
          scheduled_at: formData.scheduled_at || null,
          amount_est: formData.amount_est ? parseFloat(formData.amount_est) : null,
        }),
      })

      const result = await response.json()

      if (result.success) {
        onSuccess()
        setFormData({
          condo_id: '',
          title: '',
          description: '',
          priority: 'media',
          scheduled_at: '',
          amount_est: '',
        })
      } else {
        toast.error(result.error || 'Errore nell\'assegnazione')
      }
    } catch (error: any) {
      console.error('Error assigning job:', error)
      toast.error('Errore nell\'assegnazione intervento')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0E141B] border border-white/20 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Assegna intervento a {supplier.name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <Label htmlFor="condo_id" className="text-gray-200">
              Condominio <span className="text-[#FF8080]">*</span>
            </Label>
            <Select
              value={formData.condo_id}
              onValueChange={(value) => setFormData({ ...formData, condo_id: value })}
              required
            >
              <SelectTrigger className="bg-white/10 border-white/20 text-white mt-2">
                <SelectValue placeholder="Seleziona condominio" />
              </SelectTrigger>
              <SelectContent>
                {condominiums.map((condo) => (
                  <SelectItem key={condo.id} value={condo.id}>
                    {condo.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="title" className="text-gray-200">
              Titolo intervento <span className="text-[#FF8080]">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-white/10 border-white/20 text-white mt-2"
              placeholder="Es. Riparazione caldaia"
              required
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-gray-200">
              Descrizione
            </Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1FA9A0] mt-2"
              rows={4}
              placeholder="Dettagli dell'intervento..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority" className="text-gray-200">
                Priorità
              </Label>
              <Select
                value={formData.priority}
                onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bassa">Bassa</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="amount_est" className="text-gray-200">
                Budget stimato (€)
              </Label>
              <Input
                id="amount_est"
                type="number"
                step="0.01"
                value={formData.amount_est}
                onChange={(e) => setFormData({ ...formData, amount_est: e.target.value })}
                className="bg-white/10 border-white/20 text-white mt-2"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="scheduled_at" className="text-gray-200">
              Data/ora programmata
            </Label>
            <Input
              id="scheduled_at"
              type="datetime-local"
              value={formData.scheduled_at}
              onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
              className="bg-white/10 border-white/20 text-white mt-2"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Annulla
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-[#1FA9A0] hover:bg-[#17978E]">
              {loading ? 'Invio in corso...' : 'Assegna intervento'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

