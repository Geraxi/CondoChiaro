'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-background px-6 py-12 relative">
      {/* Back Arrow */}
      <Link 
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Torna alla home</span>
      </Link>

      <div className="max-w-4xl mx-auto pt-16">
        <div className="text-center mb-12">
          <Image
            src="/images/condochiaro-logo.png"
            alt="CondoChiaro Logo"
            width={200}
            height={60}
            className="object-contain mx-auto mb-6"
            priority
          />
          <h1 className="text-4xl font-bold mb-4">Prenota una Demo</h1>
          <p className="text-xl text-muted-foreground">
            Scopri come CondoChiaro può semplificare la gestione del tuo condominio
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Richiedi una Demo Personalizzata</CardTitle>
            <CardDescription>
              Compila il form e ti contatteremo per organizzare una dimostrazione personalizzata
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome</label>
                  <input
                    type="text"
                    placeholder="Mario Rossi"
                    className="w-full px-3 py-2 rounded-md border border-input bg-background"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <input
                    type="email"
                    placeholder="nome@esempio.com"
                    className="w-full px-3 py-2 rounded-md border border-input bg-background"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Numero di unità condominiali</label>
                <input
                  type="number"
                  placeholder="Es. 20"
                  className="w-full px-3 py-2 rounded-md border border-input bg-background"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Messaggio</label>
                <textarea
                  placeholder="Raccontaci le tue esigenze..."
                  rows={4}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background"
                />
              </div>
              <Button type="submit" className="w-full">
                Invia Richiesta
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Oppure contattaci direttamente
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button variant="outline">
                Registrati Gratis
              </Button>
            </Link>
            <Link href="/login">
              <Button>
                Accedi
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
