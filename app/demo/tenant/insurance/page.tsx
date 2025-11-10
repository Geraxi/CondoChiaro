'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, FileText } from 'lucide-react'

export default function DemoTenantInsurance() {
  return (
    <div className="min-h-screen bg-[#0E141B]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-white">Assicurazione - Demo</h1>
          <p className="text-gray-300">Visualizzazione demo delle informazioni assicurative</p>
        </div>

        <Card className="bg-[#1A1F26] border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="h-6 w-6 text-[#1FA9A0]" />
              Polizze Attive
            </CardTitle>
            <CardDescription>Polizze assicurative del condominio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'RC Condominiale', coverage: 'Responsabilità Civile', expiry: '15 Mar 2024' },
                { name: 'Infortuni', coverage: 'Infortuni Condòmini', expiry: '20 Apr 2024' },
              ].map((policy, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-[#0E141B] rounded-lg border border-white/5">
                  <div>
                    <p className="font-medium text-white">{policy.name}</p>
                    <p className="text-sm text-gray-400">{policy.coverage}</p>
                    <p className="text-xs text-gray-500 mt-1">Scadenza: {policy.expiry}</p>
                  </div>
                  <FileText className="h-5 w-5 text-gray-400 cursor-pointer hover:text-[#1FA9A0]" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}



