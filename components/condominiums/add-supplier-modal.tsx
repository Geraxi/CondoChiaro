'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'

interface AddSupplierModalProps {
  condominiumId: string
  onClose: () => void
  onSuccess: () => void
}

interface FormData {
  name: string
  email: string
  phone: string
  service_type: string
}

export function AddSupplierModal({ condominiumId, onClose, onSuccess }: AddSupplierModalProps) {
  const [submitting, setSubmitting] = useState(false)
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
    defaultValues: {
      service_type: 'manutenzione'
    }
  })

  const onSubmit = async (data: FormData) => {
    setSubmitting(true)
    try {
      const { error } = await supabase
        .from('suppliers')
        .insert({
          condominium_id: condominiumId,
          name: data.name,
          email: data.email || null,
          phone: data.phone || null,
          service_type: data.service_type
        } as any)

      if (error) throw error

      toast.success('Fornitore aggiunto con successo!')
      onSuccess()
    } catch (error: any) {
      console.error('Error adding supplier:', error)
      toast.error('Errore durante l\'aggiunta del fornitore')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#1A1F26] border border-white/10 rounded-lg p-6 w-full max-w-md"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-[#1FA9A0] to-[#27C5B9] bg-clip-text text-transparent">
              Aggiungi Fornitore
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome Fornitore *</Label>
              <Input
                id="name"
                {...register('name', { required: 'Il nome è obbligatorio' })}
                className="bg-white/5 border-white/10 mt-1"
                placeholder="Es. Pulizie Milano SRL"
              />
              {errors.name && (
                <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="service_type">Tipo Servizio *</Label>
              <Select
                value={watch('service_type')}
                onValueChange={(value) => setValue('service_type', value)}
              >
                <SelectTrigger className="bg-white/5 border-white/10 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manutenzione">Manutenzione</SelectItem>
                  <SelectItem value="pulizia">Pulizia</SelectItem>
                  <SelectItem value="sicurezza">Sicurezza</SelectItem>
                  <SelectItem value="giardinaggio">Giardinaggio</SelectItem>
                  <SelectItem value="altro">Altro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                className="bg-white/5 border-white/10 mt-1"
                placeholder="fornitore@example.com"
              />
            </div>

            <div>
              <Label htmlFor="phone">Telefono</Label>
              <Input
                id="phone"
                {...register('phone')}
                className="bg-white/5 border-white/10 mt-1"
                placeholder="+39 123 456 7890"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 bg-white/5 border-white/10"
              >
                Annulla
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-[#1FA9A0] hover:bg-[#17978E]"
              >
                {submitting ? 'Salvataggio...' : 'Salva'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

