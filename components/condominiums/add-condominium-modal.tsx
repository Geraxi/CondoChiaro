'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'

interface AddCondominiumModalProps {
  onClose: () => void
  onSuccess: () => void
}

interface FormData {
  name: string
  address: string
  units_count: string
  notes: string
}

export function AddCondominiumModal({ onClose, onSuccess }: AddCondominiumModalProps) {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    setUploading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Devi essere autenticato')
        return
      }

      let imageUrl = null

      // Upload image if provided
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('condominium-images')
          .upload(fileName, imageFile)

        if (!uploadError && uploadData) {
          const { data: { publicUrl } } = supabase.storage
            .from('condominium-images')
            .getPublicUrl(uploadData.path)
          imageUrl = publicUrl
        }
      }

      // Create condominium
      const { error } = await supabase
        .from('condominiums')
        .insert({
          name: data.name,
          address: data.address,
          units_count: parseInt(data.units_count) || 0,
          monthly_revenue: 0,
          total_tenants: 0,
          image_url: imageUrl,
          admin_id: user.id,
          notes: data.notes || null
        } as any)

      if (error) throw error

      toast.success('Condominio aggiunto con successo!')
      onSuccess()
    } catch (error: any) {
      console.error('Error adding condominium:', error)
      toast.error('Errore durante l\'aggiunta del condominio')
    } finally {
      setUploading(false)
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
              Aggiungi Condominio
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
              <Label htmlFor="name">Nome Condominio *</Label>
              <Input
                id="name"
                {...register('name', { required: 'Il nome è obbligatorio' })}
                className="bg-white/5 border-white/10 mt-1"
                placeholder="Es. Residence del Sole"
              />
              {errors.name && (
                <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="address">Indirizzo *</Label>
              <Input
                id="address"
                {...register('address', { required: 'L\'indirizzo è obbligatorio' })}
                className="bg-white/5 border-white/10 mt-1"
                placeholder="Via Roma 123, Milano"
              />
              {errors.address && (
                <p className="text-red-400 text-sm mt-1">{errors.address.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="units_count">Numero Unità</Label>
              <Input
                id="units_count"
                type="number"
                {...register('units_count')}
                className="bg-white/5 border-white/10 mt-1"
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="notes">Note</Label>
              <textarea
                id="notes"
                {...register('notes')}
                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 mt-1 min-h-[100px] resize-none"
                placeholder="Note aggiuntive..."
              />
            </div>

            <div>
              <Label htmlFor="image">Foto Condominio</Label>
              <div className="mt-2 border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label htmlFor="image" className="cursor-pointer">
                  {imageFile ? (
                    <div className="space-y-2">
                      <Building2 className="w-8 h-8 mx-auto text-[#1FA9A0]" />
                      <p className="text-sm text-gray-400">{imageFile.name}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 mx-auto text-gray-400" />
                      <p className="text-sm text-gray-400">Clicca per caricare un'immagine</p>
                    </div>
                  )}
                </label>
              </div>
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
                disabled={uploading}
                className="flex-1 bg-[#1FA9A0] hover:bg-[#17978E]"
              >
                {uploading ? 'Salvataggio...' : 'Salva'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

