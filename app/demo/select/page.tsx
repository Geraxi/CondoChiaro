'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Shield, Users, Wrench, ArrowRight, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function DemoSelectPage() {
  const dashboardTypes = [
    {
      id: 'admin',
      title: 'Dashboard Amministratore',
      description: 'Gestisci documenti, pagamenti, manutenzioni e comunicazioni per tutti i tuoi condominii',
      icon: Shield,
      color: 'from-[#1FA9A0] to-[#17978E]',
      features: [
        'Gestione multi-condominio',
        'Analisi finanziarie avanzate',
        'Comunicazioni centralizzate',
        'Documenti e verbali',
        'Manutenzioni e fornitori',
      ],
      href: '/demo/dashboards?type=admin',
    },
    {
      id: 'tenant',
      title: 'Dashboard Condòmino',
      description: 'Consulta documenti, saldo, pagamenti e segnala manutenzioni in modo semplice e veloce',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      features: [
        'Saldo e pagamenti in tempo reale',
        'Accesso a tutti i documenti',
        'Segnalazione manutenzioni',
        'Comunicazioni con amministratore',
        'Storico transazioni',
      ],
      href: '/demo/dashboards?type=tenant',
    },
    {
      id: 'supplier',
      title: 'Dashboard Fornitore',
      description: 'Gestisci ticket, ordini di lavoro, fatture e monitora le tue performance',
      icon: Wrench,
      color: 'from-purple-500 to-purple-600',
      features: [
        'Ordini di lavoro assegnati',
        'Gestione fatture e pagamenti',
        'Comunicazioni con amministratori',
        'Performance e statistiche',
        'Storico lavori completati',
      ],
      href: '/demo/dashboards?type=supplier',
    },
  ]

  return (
    <div className="min-h-screen bg-[#0E141B]">
      {/* Demo Banner */}
      <div className="bg-gradient-to-r from-[#1FA9A0]/20 to-[#1FA9A0]/10 border-b border-[#1FA9A0]/30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Eye className="h-5 w-5 text-[#1FA9A0]" />
            <div>
              <p className="font-semibold text-white">Modalità Demo</p>
              <p className="text-sm text-gray-300">Seleziona quale dashboard vuoi visualizzare</p>
            </div>
          </div>
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Torna alla Home
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Image
              src="/images/condochiaro-logo.png"
              alt="CondoChiaro Logo"
              width={120}
              height={120}
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-5xl font-bold mb-4 text-white">Scegli la Dashboard Demo</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Esplora le funzionalità di CondoChiaro attraverso le dashboard interattive.
            Seleziona il tipo di utente per vedere l'esperienza personalizzata.
          </p>
        </div>

        {/* Dashboard Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {dashboardTypes.map((dashboard) => {
            const Icon = dashboard.icon
            return (
              <Link key={dashboard.id} href={dashboard.href}>
                <Card className="bg-[#1A1F26] border-white/10 hover:border-[#1FA9A0]/60 transition-all duration-300 hover:shadow-xl hover:shadow-[#1FA9A0]/20 h-full flex flex-col cursor-pointer group">
                  <CardHeader className="flex-1">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${dashboard.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl mb-2 text-white group-hover:text-[#1FA9A0] transition-colors">
                      {dashboard.title}
                    </CardTitle>
                    <CardDescription className="text-gray-300 text-base">
                      {dashboard.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <ul className="space-y-2 mb-6 flex-1">
                      {dashboard.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#1FA9A0] mt-2 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className={`w-full bg-gradient-to-r ${dashboard.color} hover:opacity-90 text-white border-0 group-hover:scale-105 transition-transform`}
                    >
                      Visualizza Demo
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        {/* Additional Info */}
        <Card className="bg-gradient-to-r from-[#1FA9A0]/10 to-[#1FA9A0]/5 border-[#1FA9A0]/30">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2 text-white">Pronto a iniziare?</h3>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                Dopo aver esplorato le demo, registrati gratuitamente per iniziare a gestire il tuo condominio con CondoChiaro.
                Nessuna carta di credito richiesta per iniziare.
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/register">
                  <Button className="bg-[#1FA9A0] hover:bg-[#17978E]">
                    Registrati Gratis
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline">
                    Accedi
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}



