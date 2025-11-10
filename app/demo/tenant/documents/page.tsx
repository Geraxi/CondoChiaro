'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Download, Calendar } from 'lucide-react'

export default function DemoTenantDocuments() {
  return (
    <div className="min-h-screen bg-[#0E141B]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-white">Documenti - Demo</h1>
          <p className="text-gray-300">Visualizzazione demo dei documenti disponibili</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: 'Verbale Assemblea Gennaio', date: '10 Gen 2024', type: 'verbale' },
            { name: 'Bilancio Preventivo 2024', date: '5 Gen 2024', type: 'bilancio' },
            { name: 'Comunicazione Pagamenti', date: '1 Gen 2024', type: 'comunicazione' },
          ].map((doc, idx) => (
            <Card key={idx} className="bg-[#1A1F26] border-white/10">
              <CardHeader>
                <FileText className="h-8 w-8 text-[#1FA9A0] mb-2" />
                <CardTitle className="text-white">{doc.name}</CardTitle>
                <CardDescription>{doc.type}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                  <Calendar className="h-4 w-4" />
                  <span>{doc.date}</span>
                </div>
                <button className="w-full px-4 py-2 bg-[#1FA9A0] hover:bg-[#17978E] text-white rounded-lg transition text-sm">
                  <Download className="h-4 w-4 inline mr-2" />
                  Scarica
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}



