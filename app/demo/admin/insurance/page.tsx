'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, AlertTriangle, FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function DemoAdminInsurance() {
  return (
    <div className="min-h-screen bg-[#0E141B]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-white">Assicurazione - Demo</h1>
          <p className="text-gray-300">Visualizzazione demo delle polizze assicurative</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-[#1A1F26] border-white/10">
            <CardHeader>
              <CardDescription>Polizze Attive</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#1FA9A0]">3</div>
            </CardContent>
          </Card>
          <Card className="bg-[#1A1F26] border-white/10">
            <CardHeader>
              <CardDescription>In Scadenza</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-400">1</div>
            </CardContent>
          </Card>
          <Card className="bg-[#1A1F26] border-white/10">
            <CardHeader>
              <CardDescription>Scadute</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-400">0</div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-[#1A1F26] border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Polizze Assicurative</CardTitle>
            <CardDescription>Gestione delle polizze per i condominii</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'RC Condominiale', building: 'Residenza Milano Centro', expiry: '15 Mar 2024', status: 'active' },
                { name: 'Infortuni', building: 'Palazzo Roma Nord', expiry: '20 Apr 2024', status: 'active' },
                { name: 'Incendio e Furto', building: 'Residenza Milano Centro', expiry: '10 Mar 2024', status: 'expiring' },
              ].map((policy, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-[#0E141B] rounded-lg border border-white/5">
                  <div className="flex items-center gap-4">
                    <Shield className="h-8 w-8 text-[#1FA9A0]" />
                    <div>
                      <p className="font-medium text-white">{policy.name}</p>
                      <p className="text-sm text-gray-400">{policy.building}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Scadenza</p>
                      <p className="text-white font-medium">{policy.expiry}</p>
                    </div>
                    {policy.status === 'expiring' ? (
                      <Badge className="bg-yellow-500/20 text-yellow-400">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        In Scadenza
                      </Badge>
                    ) : (
                      <Badge className="bg-green-500/20 text-green-400">Attiva</Badge>
                    )}
                    <FileText className="h-5 w-5 text-gray-400 cursor-pointer hover:text-[#1FA9A0]" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}



