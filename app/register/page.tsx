'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft } from 'lucide-react'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'admin' | 'tenant' | 'supplier'>('tenant')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    // Placeholder per registrazione Supabase
    // TODO: Implementare con Supabase Auth
    setTimeout(() => {
      setMessage('Registrazione inviata! Controlla la tua email per confermare.')
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 relative">
      {/* Back Arrow */}
      <Link 
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Torna alla home</span>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/images/condochiaro-logo.png"
              alt="CondoChiaro Logo"
              width={150}
              height={45}
              className="object-contain"
              priority
            />
          </div>
          <CardTitle className="text-2xl">Registrati</CardTitle>
          <CardDescription>
            Crea il tuo account per iniziare
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                type="text"
                placeholder="Mario Rossi"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nome@esempio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Ruolo</Label>
              <Select value={role} onValueChange={(value: any) => setRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Amministratore</SelectItem>
                  <SelectItem value="tenant">Condòmino</SelectItem>
                  <SelectItem value="supplier">Fornitore</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {message && (
              <p className={`text-sm ${message.includes('errore') ? 'text-destructive' : 'text-primary'}`}>
                {message}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Registrazione...' : 'Registrati'}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Hai già un account? </span>
            <Link href="/login" className="text-primary hover:underline">
              Accedi
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
