'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings, User, Bell, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DemoSupplierSettings() {
  return (
    <div className="min-h-screen bg-[#0E141B]">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-white">Impostazioni - Demo</h1>
          <p className="text-gray-300">Visualizzazione demo delle impostazioni</p>
        </div>

        <div className="space-y-6">
          <Card className="bg-[#1A1F26] border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="h-6 w-6 text-[#1FA9A0]" />
                Profilo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">Nome Azienda</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 bg-[#0E141B] border border-white/10 rounded-lg text-white"
                    defaultValue="Idraulico Mario Rossi"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">Email</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-2 bg-[#0E141B] border border-white/10 rounded-lg text-white"
                    defaultValue="mario@idraulico.it"
                  />
                </div>
                <Button className="bg-[#1FA9A0] hover:bg-[#17978E]">
                  Salva Modifiche
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1A1F26] border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Bell className="h-6 w-6 text-[#1FA9A0]" />
                Notifiche
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { label: 'Email per nuovi ordini', enabled: true },
                  { label: 'Notifiche push', enabled: false },
                  { label: 'SMS per urgenze', enabled: true },
                ].map((setting, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-[#0E141B] rounded-lg border border-white/5">
                    <span className="text-white">{setting.label}</span>
                    <input type="checkbox" checked={setting.enabled} readOnly className="w-4 h-4" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1A1F26] border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="h-6 w-6 text-[#1FA9A0]" />
                Sicurezza
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button variant="outline" className="w-full">
                  Cambia Password
                </Button>
                <Button variant="outline" className="w-full">
                  Attiva Autenticazione a Due Fattori
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}



