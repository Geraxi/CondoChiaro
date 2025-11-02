'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check if we have the access token and refresh token in the URL
  const accessToken = searchParams.get('access_token')
  const refreshToken = searchParams.get('refresh_token')

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Validate passwords match
    if (password !== confirmPassword) {
      toast.error('Le password non coincidono')
      setLoading(false)
      return
    }

    // Validate password strength
    if (password.length < 8) {
      toast.error('La password deve essere di almeno 8 caratteri')
      setLoading(false)
      return
    }

    try {
      if (accessToken && refreshToken) {
        // User is coming from email link - set the session and update password
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })

        if (error) {
          toast.error('Link di reset non valido o scaduto')
          router.push('/reset-password')
          return
        }

        const { error: updateError } = await supabase.auth.updateUser({
          password: password
        })

        if (updateError) throw updateError

        toast.success('Password aggiornata con successo')
        router.push('/login')
      } else {
        // Just request password reset email
        toast.error('Link di reset non valido. Richiedi un nuovo reset della password.')
        router.push('/login')
      }
    } catch (error) {
      console.error('Reset password error:', error)
      toast.error('Errore durante l\'aggiornamento della password')
    } finally {
      setLoading(false)
    }
  }

  // If no tokens, redirect to login to request reset email
  if (!accessToken && !refreshToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6 relative">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>
              Link di reset non valido. Richiedi un nuovo reset della password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/login">Torna al login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
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
          <CardTitle className="text-2xl">Nuova Password</CardTitle>
          <CardDescription>
            Inserisci la tua nuova password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nuova password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimo 8 caratteri"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Conferma password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Ripeti la password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                minLength={8}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Aggiornamento...' : 'Aggiorna password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}