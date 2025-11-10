'use client'

import dynamic from 'next/dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const SafeStats = dynamic(() => import('@/components/ui/safe-stats').then(mod => ({ default: mod.SafeStats })))
import { Building2, Users, Home, Euro, ArrowRight, TrendingUp, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function DemoAdminCondominiums() {
  const condominiums = [
    {
      id: '1',
      name: 'Residenza Milano Centro',
      address: 'Via Garibaldi 15',
      city: 'Milano',
      units: 45,
      tenants: 42,
      occupied: 42,
      revenue: 11250,
      pendingPayments: 1250,
      paymentRate: 89,
      activeTickets: 2,
      image: '/images/condoimage.jpg',
    },
    {
      id: '2',
      name: 'Palazzo Roma Nord',
      address: 'Via dei Fori Imperiali 8',
      city: 'Roma',
      units: 32,
      tenants: 30,
      occupied: 30,
      revenue: 8000,
      pendingPayments: 500,
      paymentRate: 94,
      activeTickets: 1,
      image: '/images/condoimage.jpg',
    },
    {
      id: '3',
      name: 'Villa Firenze Sud',
      address: 'Viale dei Colli 22',
      city: 'Firenze',
      units: 28,
      tenants: 26,
      occupied: 26,
      revenue: 6500,
      pendingPayments: 800,
      paymentRate: 88,
      activeTickets: 0,
      image: '/images/condoimage.jpg',
    },
    {
      id: '4',
      name: 'Torre Napoli Centro',
      address: 'Via Toledo 45',
      city: 'Napoli',
      units: 60,
      tenants: 58,
      occupied: 58,
      revenue: 14500,
      pendingPayments: 2100,
      paymentRate: 86,
      activeTickets: 3,
      image: '/images/condoimage.jpg',
    },
  ]

  const totalStats = {
    totalCondominiums: condominiums.length,
    totalUnits: condominiums.reduce((sum, c) => sum + c.units, 0),
    totalTenants: condominiums.reduce((sum, c) => sum + c.tenants, 0),
    totalRevenue: condominiums.reduce((sum, c) => sum + c.revenue, 0),
    totalPending: condominiums.reduce((sum, c) => sum + c.pendingPayments, 0),
    avgPaymentRate: Math.round(condominiums.reduce((sum, c) => sum + c.paymentRate, 0) / condominiums.length),
  }

  return (
    <div className="min-h-screen bg-[#0E141B]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-white">Tutti i Condomini - Demo</h1>
          <p className="text-gray-300">Panoramica completa di tutti i condomini gestiti</p>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-[#1A1F26] border-white/10">
            <CardHeader className="pb-2">
              <CardDescription>Condomini Totali</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#1FA9A0]">{totalStats.totalCondominiums}</div>
              <p className="text-sm text-gray-400 mt-1">Gestiti</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1A1F26] border-white/10">
            <CardHeader className="pb-2">
              <CardDescription>Unità Totali</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{totalStats.totalUnits}</div>
              <p className="text-sm text-gray-400 mt-1">Appartamenti</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1A1F26] border-white/10">
            <CardHeader className="pb-2">
              <CardDescription>Condòmini Totali</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400">{totalStats.totalTenants}</div>
              <p className="text-sm text-gray-400 mt-1">Attivi</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1A1F26] border-white/10">
            <CardHeader className="pb-2">
              <CardDescription>Entrate Mensili</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400"><SafeStats value={totalStats.totalRevenue} prefix="€" /></div>
              <p className="text-sm text-gray-400 mt-1">Totale</p>
            </CardContent>
          </Card>
        </div>

        {/* Condominiums Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {condominiums.map((condo) => (
            <Card key={condo.id} className="bg-[#1A1F26] border-white/10 hover:border-[#1FA9A0]/30 transition">
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-8 w-8 text-[#1FA9A0]" />
                    <div>
                      <CardTitle className="text-white text-xl">{condo.name}</CardTitle>
                      <CardDescription>{condo.address}, {condo.city}</CardDescription>
                    </div>
                  </div>
                  {condo.activeTickets > 0 && (
                    <Badge className="bg-yellow-500/20 text-yellow-400">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {condo.activeTickets} ticket
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                      <Home className="h-4 w-4" />
                      <span>Unità</span>
                    </div>
                    <p className="text-lg font-semibold text-white">{condo.units}</p>
                    <p className="text-xs text-gray-500">{condo.occupied} occupate</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                      <Users className="h-4 w-4" />
                      <span>Condòmini</span>
                    </div>
                    <p className="text-lg font-semibold text-white">{condo.tenants}</p>
                    <p className="text-xs text-gray-500">{condo.paymentRate}% pagamenti</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Entrate Mensili</span>
                    <span className="font-semibold text-[#1FA9A0]"><SafeStats value={condo.revenue} prefix="€" /></span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">In Attesa</span>
                    <span className="font-semibold text-yellow-400"><SafeStats value={condo.pendingPayments} prefix="€" /></span>
                  </div>
                  <div className="w-full bg-[#0E141B] rounded-full h-2 mt-2">
                    <div 
                      className="bg-[#1FA9A0] h-2 rounded-full transition-all"
                      style={{ width: `${condo.paymentRate}%` }}
                    />
                  </div>
                </div>
                <Link href={`/demo/admin/condomini/${condo.id}`}>
                  <Button className="w-full bg-[#1FA9A0] hover:bg-[#17978E]">
                    Visualizza Dettagli
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

