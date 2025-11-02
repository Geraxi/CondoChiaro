'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { signIn } from '@/lib/auth-helpers'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const result = await signIn(email, password)

    if (result.success) {
      toast.success(result.message)

      // Redirect based on role
      switch (result.role) {
        case 'admin':
          router.push('/admin/dashboard')
          break
        case 'tenant':
          router.push('/tenant/dashboard')
          break
        case 'supplier':
          router.push('/supplier/dashboard')
          break
        default:
          router.push('/dashboard')
      }
    } else {
      toast.error(result.message)
    }

    setLoading(false)
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
          <CardTitle className="text-2xl">Accedi</CardTitle>
          <CardDescription>
            Inserisci la tua email per ricevere il link di accesso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
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
            {message && (
              <p className={`text-sm ${message.includes('errore') ? 'text-destructive' : 'text-primary'}`}>
                {message}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Invio in corso...' : 'Invia link di accesso'}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Non hai un account? </span>
            <Link href="/register" className="text-primary hover:underline">
              Registrati
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
