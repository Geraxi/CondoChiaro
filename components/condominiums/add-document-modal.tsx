'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'

interface AddDocumentModalProps {
  condominiumId: string
  onClose: () => void
  onSuccess: () => void
}

interface FormData {
  name: string
  category: string
}

export function AddDocumentModal({ condominiumId, onClose, onSuccess }: AddDocumentModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [generateSummary, setGenerateSummary] = useState(false)
  const [generatingSummary, setGeneratingSummary] = useState(false)
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
    defaultValues: {
      category: 'altro'
    }
  })

  const onSubmit = async (data: FormData) => {
    if (!file) {
      toast.error('Seleziona un file da caricare')
      return
    }

    setUploading(true)
    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(`condominiums/${condominiumId}/${fileName}`, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(`condominiums/${condominiumId}/${fileName}`)

      // Create document record first
      const { data: documentData, error: docError } = await (supabase as any)
        .from('documents')
        .insert({
          condominium_id: condominiumId,
          name: data.name,
          file_url: publicUrl,
          category: data.category,
          file_size: file.size,
          file_type: file.type,
          ai_summary: null
        } as Record<string, unknown>)
        .select('id')
        .single()

      if (docError) throw docError

      // Generate AI summary if requested and file is PDF
      const createdDocumentId = (documentData?.id || null) as string | null

      if (generateSummary && file.type === 'application/pdf' && createdDocumentId) {
        setGeneratingSummary(true)
        try {
          const { data: { session } } = await supabase.auth.getSession()
          const response = await fetch('/api/ai/summarize', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session?.access_token}`,
            },
            body: JSON.stringify({
              documentId: createdDocumentId,
            }),
          })

          if (response.ok) {
            const result = await response.json()
            if (result.success && result.data?.summary) {
              toast.success('Documento caricato e riassunto generato!')
            } else {
              toast.success('Documento caricato! (Generazione riassunto non riuscita)')
            }
          }
        } catch (error) {
          console.error('Error generating summary:', error)
          toast.success('Documento caricato! (Generazione riassunto non disponibile)')
        } finally {
          setGeneratingSummary(false)
        }
      } else {
        toast.success('Documento caricato con successo!')
      }

      onSuccess()
    } catch (error: any) {
      console.error('Error uploading document:', error)
      toast.error('Errore durante il caricamento del documento')
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
              Carica Documento
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
              <Label htmlFor="name">Nome Documento *</Label>
              <Input
                id="name"
                {...register('name', { required: 'Il nome è obbligatorio' })}
                className="bg-white/5 border-white/10 mt-1"
                placeholder="Es. Verbale Assemblea Gennaio 2024"
              />
              {errors.name && (
                <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="category">Categoria *</Label>
              <Select
                value={watch('category')}
                onValueChange={(value) => setValue('category', value)}
              >
                <SelectTrigger className="bg-white/5 border-white/10 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="assicurazione">Assicurazione</SelectItem>
                  <SelectItem value="bilancio">Bilancio</SelectItem>
                  <SelectItem value="verbale">Verbale Assemblea</SelectItem>
                  <SelectItem value="manutenzione">Manutenzione</SelectItem>
                  <SelectItem value="contratti">Contratti</SelectItem>
                  <SelectItem value="altro">Altro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="file">File *</Label>
              <div className="mt-2 border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="file"
                  accept=".pdf,.doc,.docx,.jpg,.png"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label htmlFor="file" className="cursor-pointer">
                  {file ? (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 mx-auto text-[#1FA9A0]" />
                      <p className="text-sm text-gray-400">{file.name}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 mx-auto text-gray-400" />
                      <p className="text-sm text-gray-400">Clicca per caricare un file</p>
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
                disabled={uploading || generatingSummary || !file}
                className="flex-1 bg-[#1FA9A0] hover:bg-[#17978E]"
              >
                {uploading
                  ? 'Caricamento...'
                  : generatingSummary
                    ? 'Generazione riassunto...'
                    : 'Carica'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
