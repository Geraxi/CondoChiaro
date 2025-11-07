import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0E141B] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#1A1F26] border border-white/10 rounded-lg p-8 text-center">
        <h2 className="text-4xl font-bold mb-4">404</h2>
        <h3 className="text-2xl font-semibold mb-2">Pagina non trovata</h3>
        <p className="text-gray-400 mb-6">
          La pagina che stai cercando non esiste o è stata spostata.
        </p>
        <Link href="/">
          <Button className="bg-[#1FA9A0] hover:bg-[#17978E]">
            <Home className="w-4 h-4 mr-2" />
            Torna alla Home
          </Button>
        </Link>
      </div>
    </div>
  )
}







