'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, FileSpreadsheet, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DemoAdminMigration() {
  return (
    <div className="min-h-screen bg-[#0E141B]">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-white">Migrazione Dati - Demo</h1>
          <p className="text-gray-300">Visualizzazione demo del processo di migrazione dati</p>
        </div>

        <Card className="bg-[#1A1F26] border-white/10 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Upload className="h-6 w-6 text-[#1FA9A0]" />
              Carica File Excel/CSV
            </CardTitle>
            <CardDescription>Importa i dati dei condòmini da un file Excel o CSV</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
              <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300 mb-4">Trascina qui il file o clicca per selezionare</p>
              <Button className="bg-[#1FA9A0] hover:bg-[#17978E]">
                Seleziona File
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1F26] border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Stato Migrazione</CardTitle>
            <CardDescription>Ultime migrazioni completate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Residenza Milano Centro', units: 45, date: '15 Gen 2024', status: 'completed' },
                { name: 'Palazzo Roma Nord', units: 32, date: '10 Gen 2024', status: 'completed' },
              ].map((migration, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-[#0E141B] rounded-lg border border-white/5">
                  <div>
                    <p className="font-medium text-white">{migration.name}</p>
                    <p className="text-sm text-gray-400">{migration.units} unità • {migration.date}</p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}



