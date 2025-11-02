'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Calendar, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function AdminInsurance() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Assicurazione</h1>
        <p className="text-muted-foreground">Monitoraggio polizze e promemoria di rinnovo</p>
      </div>

      <Card className="bg-[#1A1F26] border-white/10 mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#1FA9A0]" />
            Polizza Attiva
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Compagnia</p>
              <p className="font-semibold">Assicurazioni Condominiali SRL</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Numero Polizza</p>
              <p className="font-semibold">POL-2024-001</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Copertura</p>
              <p className="font-semibold">€500,000</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Scadenza</p>
              <div className="flex items-center gap-2">
                <p className="font-semibold">15 Marzo 2024</p>
                <Badge className="bg-yellow-500/20 text-yellow-400">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  45 giorni rimanenti
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1A1F26] border-white/10">
        <CardHeader>
          <CardTitle>Storico Polizze</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { period: '2023-2024', company: 'Assicurazioni Condominiali SRL', status: 'attiva' },
              { period: '2022-2023', company: 'Assicurazioni Condominiali SRL', status: 'scaduta' },
            ].map((policy, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-[#0E141B] rounded-lg border border-white/5">
                <div>
                  <h4 className="font-medium">{policy.period}</h4>
                  <p className="text-sm text-muted-foreground">{policy.company}</p>
                </div>
                <Badge className={policy.status === 'attiva' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
                  {policy.status === 'attiva' ? 'Attiva' : 'Scaduta'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
