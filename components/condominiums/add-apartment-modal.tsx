'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'

interface AddApartmentModalProps {
  condominiumId: string
  onClose: () => void
  onSuccess: () => void
}

interface FormData {
  unit_number: string
  floor: string
  internal_number: string
  size_mq: string
  owner_name: string
}

export function AddApartmentModal({ condominiumId, onClose, onSuccess }: AddApartmentModalProps) {
  const [submitting, setSubmitting] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    setSubmitting(true)
    try {
      const { error } = await supabase
        .from('apartments')
        .insert({
          condominium_id: condominiumId,
          unit_number: data.unit_number,
          floor: data.floor || null,
          internal_number: data.internal_number || null,
          size_mq: data.size_mq ? parseFloat(data.size_mq) : null,
          owner_name: data.owner_name || null
        } as any)

      if (error) throw error

      toast.success('Appartamento aggiunto con successo!')
      onSuccess()
    } catch (error: any) {
      console.error('Error adding apartment:', error)
      toast.error('Errore durante l\'aggiunta dell\'appartamento')
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
              Aggiungi Appartamento
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
              <Label htmlFor="unit_number">Numero Unità *</Label>
              <Input
                id="unit_number"
                {...register('unit_number', { required: 'Il numero unità è obbligatorio' })}
                className="bg-white/5 border-white/10 mt-1"
                placeholder="A1"
              />
              {errors.unit_number && (
                <p className="text-red-400 text-sm mt-1">{errors.unit_number.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="floor">Piano</Label>
              <Input
                id="floor"
                {...register('floor')}
                className="bg-white/5 border-white/10 mt-1"
                placeholder="1"
              />
            </div>

            <div>
              <Label htmlFor="internal_number">Interno</Label>
              <Input
                id="internal_number"
                {...register('internal_number')}
                className="bg-white/5 border-white/10 mt-1"
                placeholder="1"
              />
            </div>

            <div>
              <Label htmlFor="size_mq">Metri Quadri</Label>
              <Input
                id="size_mq"
                type="number"
                step="0.01"
                {...register('size_mq')}
                className="bg-white/5 border-white/10 mt-1"
                placeholder="85.5"
              />
            </div>

            <div>
              <Label htmlFor="owner_name">Nome Proprietario</Label>
              <Input
                id="owner_name"
                {...register('owner_name')}
                className="bg-white/5 border-white/10 mt-1"
                placeholder="Mario Rossi"
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

