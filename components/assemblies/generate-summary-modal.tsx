'use client'

import { useState } from 'react'
import { Sparkles, Loader2, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface GenerateSummaryModalProps {
  assemblyId: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function GenerateSummaryModal({ assemblyId, isOpen, onClose, onSuccess }: GenerateSummaryModalProps) {
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<string>('')
  const [editableSummary, setEditableSummary] = useState<string>('')
  const [approved, setApproved] = useState(false)

  const generateSummary = async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('Sessione non valida')
        return
      }

      const response = await fetch(`/api/assemblies/${assemblyId}/generate-summary`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error?.message || 'Errore nella generazione del verbale')
      }

      setSummary(result.data.summary_text)
      setEditableSummary(result.data.summary_text)
      toast.success('Verbale sintetico generato con successo!')
    } catch (error: any) {
      console.error('Error generating summary:', error)
      toast.error(error.message || 'Errore nella generazione del verbale')
    } finally {
      setLoading(false)
    }
  }

  const approveSummary = async () => {
    if (!summary) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('Sessione non valida')
        return
      }

      // Update the summary with edited text and approve
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('assembly_summaries')
        .update({
          summary_text: editableSummary,
          approved: true,
        })
        .eq('assembly_id', assemblyId)
        .eq('admin_id', user.id)

      if (error) throw error

      setApproved(true)
      toast.success('Verbale approvato e salvato!')
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 1500)
    } catch (error: any) {
      console.error('Error approving summary:', error)
      toast.error('Errore nel salvataggio del verbale')
    }
  }

  const handleClose = () => {
    setSummary('')
    setEditableSummary('')
    setApproved(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#1A1F26] border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#1FA9A0]" />
            Genera Verbale Sintetico
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Genera un riassunto automatico dell'assemblea utilizzando l'AI
          </DialogDescription>
        </DialogHeader>

        {!summary ? (
          <div className="py-8">
            <Card className="bg-[#0E141B] border-white/10">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <Sparkles className="h-12 w-12 text-[#1FA9A0] mx-auto" />
                  <p className="text-gray-300">
                    Clicca il pulsante per generare automaticamente un verbale sintetico dell'assemblea
                  </p>
                  <Button
                    onClick={generateSummary}
                    disabled={loading}
                    className="bg-[#1FA9A0] hover:bg-[#17978E]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generazione in corso...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Genera Verbale Sintetico
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-white mb-2 block">
                Verbale Generato (modificabile)
              </label>
              <Textarea
                value={editableSummary}
                onChange={(e) => setEditableSummary(e.target.value)}
                className="min-h-[300px] bg-[#0E141B] border-white/10 text-white"
                placeholder="Il verbale sintetico apparirà qui..."
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                {approved && (
                  <div className="flex items-center gap-2 text-green-400">
                    <Check className="h-5 w-5" />
                    <span className="text-sm">Approvato e salvato</span>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={loading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Annulla
                </Button>
                <Button
                  onClick={approveSummary}
                  disabled={loading || approved}
                  className="bg-[#1FA9A0] hover:bg-[#17978E]"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approva e Salva
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}



