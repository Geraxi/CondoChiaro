'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText } from 'lucide-react'

const documents = [
  { id: 1, title: 'Verbale Assemblea Gennaio', date: '2024-01-10', type: 'verbale' },
  { id: 2, title: 'Preventivo Manutenzione', date: '2024-01-08', type: 'preventivo' },
  { id: 3, title: 'Fattura Pulizie', date: '2024-01-05', type: 'fattura' },
]

export function CardDocuments() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Documenti Recenti</CardTitle>
        <CardDescription>Ultimi documenti caricati</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center gap-3 p-3 bg-[#0E141B] rounded-lg border border-white/5 hover:border-[#1FA9A0]/30 transition">
              <FileText className="h-5 w-5 text-[#1FA9A0]" />
              <div className="flex-1">
                <h4 className="font-medium text-sm">{doc.title}</h4>
                <p className="text-xs text-muted-foreground">{doc.date}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
