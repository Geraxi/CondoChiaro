'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Download, Eye, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function DemoAdminDocuments() {
  const mockDocuments = [
    { id: '1', name: 'Verbale Assemblea Gennaio 2024', type: 'verbale', date: '15 Gen 2024', status: 'valid' },
    { id: '2', name: 'Bilancio Consuntivo 2023', type: 'bilancio', date: '10 Gen 2024', status: 'valid' },
    { id: '3', name: 'Polizza Assicurativa', type: 'assicurazione', date: '1 Dic 2024', status: 'expiring' },
    { id: '4', name: 'Contratto Fornitore Idraulico', type: 'contratto', date: '5 Nov 2023', status: 'valid' },
  ]

  return (
    <div className="min-h-screen bg-[#0E141B]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-white">Documenti - Demo</h1>
          <p className="text-gray-300">Visualizzazione demo dei documenti condominiali</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockDocuments.map((doc) => (
            <Card key={doc.id} className="bg-[#1A1F26] border-white/10">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <FileText className="h-8 w-8 text-[#1FA9A0] mb-2" />
                  <Badge 
                    variant={doc.status === 'valid' ? 'default' : 'secondary'}
                    className={doc.status === 'expiring' ? 'bg-yellow-500/20 text-yellow-400' : ''}
                  >
                    {doc.status === 'valid' ? '✅ Valido' : '⚠️ In Scadenza'}
                  </Badge>
                </div>
                <CardTitle className="text-white">{doc.name}</CardTitle>
                <CardDescription>{doc.type}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                  <Calendar className="h-4 w-4" />
                  <span>{doc.date}</span>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-2 bg-[#1FA9A0]/20 hover:bg-[#1FA9A0]/30 text-[#1FA9A0] rounded-lg transition text-sm">
                    <Eye className="h-4 w-4 inline mr-2" />
                    Visualizza
                  </button>
                  <button className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition text-sm">
                    <Download className="h-4 w-4 inline mr-2" />
                    Scarica
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

