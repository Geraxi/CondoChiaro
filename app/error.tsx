'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#0E141B] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#1A1F26] border border-white/10 rounded-lg p-8 text-center">
        <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-orange-400" />
        <h2 className="text-2xl font-bold mb-2">Qualcosa è andato storto!</h2>
        <p className="text-gray-400 mb-6">
          {error.message || 'Si è verificato un errore imprevisto'}
        </p>
        <div className="flex gap-3 justify-center">
          <Button
            onClick={reset}
            className="bg-[#1FA9A0] hover:bg-[#17978E]"
          >
            Riprova
          </Button>
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            className="bg-white/5 border-white/10"
          >
            Torna alla Home
          </Button>
        </div>
      </div>
    </div>
  )
}







