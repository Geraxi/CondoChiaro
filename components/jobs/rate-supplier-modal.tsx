'use client'

import { useState } from 'react'
import { Star, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface RateSupplierModalProps {
  supplierId: string
  jobId: string
  supplierName: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function RateSupplierModal({
  supplierId,
  jobId,
  supplierName,
  isOpen,
  onClose,
  onSuccess,
}: RateSupplierModalProps) {
  const [loading, setLoading] = useState(false)
  const [ratings, setRatings] = useState({
    quality: 0,
    timeliness: 0,
    communication: 0,
  })
  const [comments, setComments] = useState('')

  const handleStarClick = (category: 'quality' | 'timeliness' | 'communication', value: number) => {
    setRatings({ ...ratings, [category]: value })
  }

  const handleSubmit = async () => {
    if (ratings.quality === 0 || ratings.timeliness === 0 || ratings.communication === 0) {
      toast.error('Per favore, valuta tutti gli aspetti')
      return
    }

    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('Sessione non valida')
        return
      }

      const response = await fetch(`/api/suppliers/${supplierId}/rate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_id: jobId,
          quality_rating: ratings.quality,
          timeliness_rating: ratings.timeliness,
          communication_rating: ratings.communication,
          comments: comments || null,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error?.message || 'Errore nel salvataggio della valutazione')
      }

      toast.success('Valutazione salvata con successo!')
      onSuccess()
      onClose()
      // Reset form
      setRatings({ quality: 0, timeliness: 0, communication: 0 })
      setComments('')
    } catch (error: any) {
      console.error('Error rating supplier:', error)
      toast.error(error.message || 'Errore nel salvataggio della valutazione')
    } finally {
      setLoading(false)
    }
  }

  const StarRating = ({ 
    value, 
    onChange 
  }: { 
    value: number
    onChange: (value: number) => void 
  }) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none"
          >
            <Star
              className={`h-6 w-6 ${
                star <= value
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-400 fill-gray-400/20'
              } hover:text-yellow-400 transition-colors`}
            />
          </button>
        ))}
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-[#1A1F26] border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white">Valuta il Fornitore</DialogTitle>
          <DialogDescription className="text-gray-400">
            Valuta {supplierName} per il lavoro completato
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Quality Rating */}
          <div>
            <Label className="text-white mb-3 block">Qualità del Lavoro</Label>
            <StarRating
              value={ratings.quality}
              onChange={(value) => handleStarClick('quality', value)}
            />
          </div>

          {/* Timeliness Rating */}
          <div>
            <Label className="text-white mb-3 block">Puntualità</Label>
            <StarRating
              value={ratings.timeliness}
              onChange={(value) => handleStarClick('timeliness', value)}
            />
          </div>

          {/* Communication Rating */}
          <div>
            <Label className="text-white mb-3 block">Comunicazione</Label>
            <StarRating
              value={ratings.communication}
              onChange={(value) => handleStarClick('communication', value)}
            />
          </div>

          {/* Comments */}
          <div>
            <Label htmlFor="comments" className="text-white mb-2 block">
              Commenti (opzionale)
            </Label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Aggiungi un commento sulla tua esperienza..."
              className="min-h-[100px]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Annulla
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || ratings.quality === 0 || ratings.timeliness === 0 || ratings.communication === 0}
              className="bg-[#1FA9A0] hover:bg-[#17978E]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvataggio...
                </>
              ) : (
                'Salva Valutazione'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}



