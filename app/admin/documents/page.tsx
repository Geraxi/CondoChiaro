'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AdminDocuments() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Documenti</h1>
          <p className="text-muted-foreground">Gestisci e carica documenti condominiali</p>
        </div>
        <Button className="bg-[#1FA9A0] hover:bg-[#17978E]">
          <Upload className="h-4 w-4 mr-2" />
          Carica Documento
        </Button>
      </div>

      <Card className="bg-[#1A1F26] border-white/10">
        <CardHeader>
          <CardTitle>Documenti Condominiali</CardTitle>
          <CardDescription>Elenco di tutti i documenti caricati</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: 'Verbale Assemblea Gennaio 2024', date: '15 Gen 2024', type: 'Verbale', size: '2.3 MB' },
              { name: 'Preventivo Manutenzione Ascensore', date: '10 Gen 2024', type: 'Preventivo', size: '1.8 MB' },
              { name: 'Fattura Pulizie Dicembre', date: '5 Gen 2024', type: 'Fattura', size: '850 KB' },
            ].map((doc, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 bg-[#0E141B] rounded-lg border border-white/5 hover:border-[#1FA9A0]/30 transition">
                <FileText className="h-8 w-8 text-[#1FA9A0]" />
                <div className="flex-1">
                  <h4 className="font-medium">{doc.name}</h4>
                  <p className="text-sm text-muted-foreground">{doc.type} • {doc.date} • {doc.size}</p>
                </div>
                <Button variant="outline" size="sm">Visualizza</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
