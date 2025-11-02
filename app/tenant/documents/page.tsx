'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function TenantDocuments() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Documenti</h1>
        <p className="text-muted-foreground">Visualizza documenti e riepiloghi</p>
      </div>

      <Card className="bg-[#1A1F26] border-white/10">
        <CardHeader>
          <CardTitle>Documenti Disponibili</CardTitle>
          <CardDescription>Documenti condominiali per la tua unità</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: 'Verbale Assemblea Gennaio 2024', date: '15 Gen 2024', type: 'Verbale', size: '2.3 MB' },
              { name: 'Riepilogo Spese 2023', date: '10 Gen 2024', type: 'Riepilogo', size: '1.5 MB' },
              { name: 'Fattura Quote Condominiali', date: '5 Gen 2024', type: 'Fattura', size: '850 KB' },
            ].map((doc, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 bg-[#0E141B] rounded-lg border border-white/5 hover:border-[#1FA9A0]/30 transition">
                <FileText className="h-8 w-8 text-[#1FA9A0]" />
                <div className="flex-1">
                  <h4 className="font-medium">{doc.name}</h4>
                  <p className="text-sm text-muted-foreground">{doc.type} • {doc.date} • {doc.size}</p>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Scarica
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
