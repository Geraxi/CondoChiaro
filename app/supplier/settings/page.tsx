'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings, User, Bell, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SupplierSettings() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Impostazioni</h1>
        <p className="text-muted-foreground">Gestisci il tuo profilo e preferenze</p>
      </div>

      <div className="space-y-6">
        <Card className="bg-[#1A1F26] border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-[#1FA9A0]" />
              Profilo
            </CardTitle>
            <CardDescription>Informazioni personali e contatti</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nome Azienda</Label>
              <Input id="name" defaultValue="Tecno Service SRL" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="info@tecnoservice.it" />
            </div>
            <div>
              <Label htmlFor="phone">Telefono</Label>
              <Input id="phone" defaultValue="+39 02 1234567" />
            </div>
            <Button className="bg-[#1FA9A0] hover:bg-[#17978E]">Salva Modifiche</Button>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1F26] border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-[#1FA9A0]" />
              Notifiche
            </CardTitle>
            <CardDescription>Preferenze notifiche</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Ricevi notifiche via email</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Nuovi Ticket</p>
                <p className="text-sm text-muted-foreground">Notifica quando ricevi nuovi ticket</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Pagamenti</p>
                <p className="text-sm text-muted-foreground">Notifica quando ricevi pagamenti</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1F26] border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#1FA9A0]" />
              Sicurezza
            </CardTitle>
            <CardDescription>Password e autenticazione</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="current-password">Password Attuale</Label>
              <Input id="current-password" type="password" />
            </div>
            <div>
              <Label htmlFor="new-password">Nuova Password</Label>
              <Input id="new-password" type="password" />
            </div>
            <div>
              <Label htmlFor="confirm-password">Conferma Password</Label>
              <Input id="confirm-password" type="password" />
            </div>
            <Button className="bg-[#1FA9A0] hover:bg-[#17978E]">Aggiorna Password</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
