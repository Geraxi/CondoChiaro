'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase, Apartment } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'

interface AddTenantModalProps {
  condominiumId: string
  apartments: Apartment[]
  onClose: () => void
  onSuccess: () => void
}

interface FormData {
  name: string
  surname: string
  email: string
  phone: string
  payment_status: string
  apartment_id: string
}

export function AddTenantModal({ condominiumId, apartments, onClose, onSuccess }: AddTenantModalProps) {
  const [submitting, setSubmitting] = useState(false)
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
    defaultValues: {
      payment_status: 'pending'
    }
  })

  const apartmentId = watch('apartment_id')

  const onSubmit = async (data: FormData) => {
    setSubmitting(true)
    try {
      const { error } = await supabase
        .from('tenants')
        .insert({
          condominium_id: condominiumId,
          apartment_id: data.apartment_id || null,
          name: data.name,
          surname: data.surname,
          email: data.email,
          phone: data.phone || null,
          payment_status: data.payment_status
        } as any)

      if (error) throw error

      toast.success('Inquilino aggiunto con successo!')
      onSuccess()
    } catch (error: any) {
      console.error('Error adding tenant:', error)
      toast.error('Errore durante l\'aggiunta dell\'inquilino')
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
          className="bg-[#1A1F26] border border-white/10 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-[#1FA9A0] to-[#27C5B9] bg-clip-text text-transparent">
              Aggiungi Inquilino
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
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                {...register('name', { required: 'Il nome è obbligatorio' })}
                className="bg-white/5 border-white/10 mt-1"
                placeholder="Mario"
              />
              {errors.name && (
                <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="surname">Cognome *</Label>
              <Input
                id="surname"
                {...register('surname', { required: 'Il cognome è obbligatorio' })}
                className="bg-white/5 border-white/10 mt-1"
                placeholder="Rossi"
              />
              {errors.surname && (
                <p className="text-red-400 text-sm mt-1">{errors.surname.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register('email', { required: 'L\'email è obbligatoria' })}
                className="bg-white/5 border-white/10 mt-1"
                placeholder="mario.rossi@example.com"
              />
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
              )}
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

            <div>
              <Label htmlFor="apartment_id">Appartamento</Label>
              <Select value={apartmentId} onValueChange={(value) => setValue('apartment_id', value)}>
                <SelectTrigger className="bg-white/5 border-white/10 mt-1">
                  <SelectValue placeholder="Seleziona appartamento (opzionale)" />
                </SelectTrigger>
                <SelectContent>
                  {apartments.map((apartment) => (
                    <SelectItem key={apartment.id} value={apartment.id}>
                      {apartment.unit_number} {apartment.floor && `(Piano ${apartment.floor})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="payment_status">Stato Pagamento</Label>
              <Select
                value={watch('payment_status')}
                onValueChange={(value) => setValue('payment_status', value)}
              >
                <SelectTrigger className="bg-white/5 border-white/10 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">In attesa</SelectItem>
                  <SelectItem value="paid">Pagato</SelectItem>
                  <SelectItem value="overdue">In ritardo</SelectItem>
                </SelectContent>
              </Select>
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

