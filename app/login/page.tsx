'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { TEST_CREDENTIALS } from '@/lib/dev-test-auth'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const redirectTo = useMemo(() => searchParams.get('redirect') ?? undefined, [searchParams])

  const signInWithCredentials = async (loginEmail: string, loginPassword: string) => {
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/auth/test-login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
          redirect: redirectTo,
        }),
      })

      const data: { success?: boolean; message?: string; redirectTo?: string } = await response.json()

      if (!response.ok || !data.success || !data.redirectTo) {
        throw new Error(data.message || 'Credenziali non valide')
      }

      setMessage('Accesso riuscito. Apertura dashboard...')
      window.location.assign(data.redirectTo)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore durante l\'accesso'
      setMessage(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    await signInWithCredentials(email, password)
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
              height={150}
              className="object-contain"
              priority
            />
          </div>
          <CardTitle className="text-2xl">Accedi</CardTitle>
          <CardDescription>
            Inserisci email e password per entrare nella dashboard di test
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
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Inserisci la password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {message && (
              <p className={`text-sm ${message.includes('errore') ? 'text-destructive' : 'text-primary'}`}>
                {message}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Accesso in corso...' : 'Accedi'}
            </Button>
          </form>
          <div className="mt-6 rounded-lg border border-[#1FA9A0]/30 bg-[#1FA9A0]/10 p-4">
            <p className="text-sm font-semibold text-[#1FA9A0] mb-2">Credenziali test disponibili</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {TEST_CREDENTIALS.map((credential) => (
                <li key={credential.email}>
                  <span className="font-medium text-foreground">{credential.role}:</span>{' '}
                  {credential.email} / {credential.password}
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-2">
              {TEST_CREDENTIALS.map((credential) => (
                <Button
                  key={`quick-${credential.email}`}
                  type="button"
                  variant="outline"
                  className="w-full justify-start text-left"
                  disabled={loading}
                  onClick={() => {
                    setEmail(credential.email)
                    setPassword(credential.password)
                    void signInWithCredentials(credential.email, credential.password)
                  }}
                >
                  Entra come {credential.role}
                </Button>
              ))}
            </div>
          </div>
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
