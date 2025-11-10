'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

const SafeStats = dynamic(() => import('@/components/ui/safe-stats').then(mod => ({ default: mod.SafeStats })))
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Users, Home, Euro, ArrowLeft, FileText, Wrench, Wallet, Droplet, Zap, Flame } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'

export default function DemoCondominiumDetail() {
  const params = useParams()
  const [activeTab, setActiveTab] = useState('overview')

  // Mock data for a specific condominium
  const condominium = {
    id: (params?.id as string) || '1',
    name: 'Residenza Milano Centro',
    address: 'Via Garibaldi 15',
    city: 'Milano',
    postalCode: '20121',
    units: 45,
    tenants: 42,
    monthlyRevenue: 11250,
    pendingPayments: 1250,
  }

  const tenants = [
    { id: '1', name: 'Mario', surname: 'Rossi', email: 'mario.rossi@email.com', apartment: 'A1', phone: '+39 123 456 7890', paymentStatus: 'paid', balance: 0, usage: { water: 45, electricity: 120, gas: 85 } },
    { id: '2', name: 'Luisa', surname: 'Bianchi', email: 'luisa.bianchi@email.com', apartment: 'A2', phone: '+39 123 456 7891', paymentStatus: 'paid', balance: 0, usage: { water: 38, electricity: 95, gas: 72 } },
    { id: '3', name: 'Giuseppe', surname: 'Verdi', email: 'giuseppe.verdi@email.com', apartment: 'A3', phone: '+39 123 456 7892', paymentStatus: 'pending', balance: 250, usage: { water: 52, electricity: 135, gas: 98 } },
    { id: '4', name: 'Anna', surname: 'Ferrari', email: 'anna.ferrari@email.com', apartment: 'B1', phone: '+39 123 456 7893', paymentStatus: 'overdue', balance: 500, usage: { water: 41, electricity: 110, gas: 80 } },
    { id: '5', name: 'Marco', surname: 'Romano', email: 'marco.romano@email.com', apartment: 'B2', phone: '+39 123 456 7894', paymentStatus: 'paid', balance: 0, usage: { water: 35, electricity: 88, gas: 65 } },
  ]

  const apartments = [
    { id: '1', unit: 'A1', floor: '1', size: 85, owner: 'Mario Rossi', occupied: true, tenant: 'Mario Rossi' },
    { id: '2', unit: 'A2', floor: '1', size: 75, owner: 'Luisa Bianchi', occupied: true, tenant: 'Luisa Bianchi' },
    { id: '3', unit: 'A3', floor: '1', size: 90, owner: 'Giuseppe Verdi', occupied: true, tenant: 'Giuseppe Verdi' },
    { id: '4', unit: 'B1', floor: '2', size: 100, owner: 'Anna Ferrari', occupied: true, tenant: 'Anna Ferrari' },
    { id: '5', unit: 'B2', floor: '2', size: 80, owner: 'Marco Romano', occupied: true, tenant: 'Marco Romano' },
    { id: '6', unit: 'B3', floor: '2', size: 95, owner: 'Paolo Neri', occupied: false, tenant: null },
  ]

  const bills = [
    { id: '1', type: 'Quota Condominiale', period: 'Gennaio 2024', amount: 250, due: '15 Gen 2024', status: 'paid', tenant: 'Mario Rossi' },
    { id: '2', type: 'Quota Condominiale', period: 'Gennaio 2024', amount: 250, due: '15 Gen 2024', status: 'paid', tenant: 'Luisa Bianchi' },
    { id: '3', type: 'Quota Condominiale', period: 'Gennaio 2024', amount: 250, due: '15 Gen 2024', status: 'pending', tenant: 'Giuseppe Verdi' },
    { id: '4', type: 'Quota Condominiale', period: 'Dicembre 2023', amount: 250, due: '15 Dic 2023', status: 'overdue', tenant: 'Anna Ferrari' },
    { id: '5', type: 'Fondo Manutenzione', period: 'Q1 2024', amount: 150, due: '1 Mar 2024', status: 'pending', tenant: 'Mario Rossi' },
  ]

  return (
    <div className="min-h-screen bg-[#0E141B]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/demo/admin/condomini">
            <Button variant="ghost" size="sm" className="mb-4 text-gray-400 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Torna ai Condomini
            </Button>
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-white">{condominium.name}</h1>
              <p className="text-gray-300">{condominium.address}, {condominium.city} {condominium.postalCode}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Entrate Mensili</p>
              <p className="text-2xl font-bold text-[#1FA9A0]"><SafeStats value={condominium.monthlyRevenue} prefix="€" /></p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-[#1A1F26] border-white/10">
            <CardHeader className="pb-2">
              <CardDescription>Unità</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{condominium.units}</div>
              <p className="text-xs text-gray-400 mt-1">{apartments.filter(a => a.occupied).length} occupate</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1A1F26] border-white/10">
            <CardHeader className="pb-2">
              <CardDescription>Condòmini</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">{condominium.tenants}</div>
              <p className="text-xs text-gray-400 mt-1">Attivi</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1A1F26] border-white/10">
            <CardHeader className="pb-2">
              <CardDescription>Pagamenti</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">89%</div>
              <p className="text-xs text-gray-400 mt-1">In regola</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1A1F26] border-white/10">
            <CardHeader className="pb-2">
              <CardDescription>In Attesa</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400"><SafeStats value={condominium.pendingPayments} prefix="€" /></div>
              <p className="text-xs text-gray-400 mt-1">Da incassare</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 bg-[#1A1F26]">
            <TabsTrigger value="overview">Panoramica</TabsTrigger>
            <TabsTrigger value="tenants">Condòmini</TabsTrigger>
            <TabsTrigger value="apartments">Appartamenti</TabsTrigger>
            <TabsTrigger value="bills">Fatturazione</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-[#1A1F26] border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Riepilogo Condominio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Unità Totali</span>
                      <span className="text-white font-semibold">{condominium.units}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Unità Occupate</span>
                      <span className="text-white font-semibold">{apartments.filter(a => a.occupied).length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Unità Libere</span>
                      <span className="text-white font-semibold">{apartments.filter(a => !a.occupied).length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Condòmini Attivi</span>
                      <span className="text-white font-semibold">{condominium.tenants}</span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                      <span className="text-gray-400">Tasso Occupazione</span>
                      <span className="text-[#1FA9A0] font-semibold">
                        {Math.round((apartments.filter(a => a.occupied).length / condominium.units) * 100)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1A1F26] border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Stato Pagamenti</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                  {[
                    { status: 'Pagati', count: tenants.filter(t => t.paymentStatus === 'paid').length, amount: 8750, color: 'text-green-400' },
                    { status: 'In Attesa', count: tenants.filter(t => t.paymentStatus === 'pending').length, amount: 250, color: 'text-yellow-400' },
                    { status: 'Scaduti', count: tenants.filter(t => t.paymentStatus === 'overdue').length, amount: 500, color: 'text-red-400' },
                  ].map((stat, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-[#0E141B] rounded-lg border border-white/5">
                      <div>
                        <p className="text-white font-medium">{stat.status}</p>
                        <p className="text-sm text-gray-400">{stat.count} condòmini</p>
                      </div>
                      <p className={`font-semibold ${stat.color}`}><SafeStats value={stat.amount} prefix="€" /></p>
                    </div>
                  ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tenants Tab */}
          <TabsContent value="tenants" className="space-y-6">
            <Card className="bg-[#1A1F26] border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Elenco Condòmini</CardTitle>
                    <CardDescription>{tenants.length} condòmini attivi</CardDescription>
                  </div>
                  <Button className="bg-[#1FA9A0] hover:bg-[#17978E]">
                    Aggiungi Condòmino
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tenants.map((tenant) => (
                    <div key={tenant.id} className="p-4 bg-[#0E141B] rounded-lg border border-white/5 hover:border-[#1FA9A0]/30 transition">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Users className="h-5 w-5 text-[#1FA9A0]" />
                            <div>
                              <p className="font-semibold text-white">{tenant.name} {tenant.surname}</p>
                              <p className="text-sm text-gray-400">{tenant.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-400 ml-8">
                            <span>Appartamento: {tenant.apartment}</span>
                            <span>•</span>
                            <span>{tenant.phone}</span>
                          </div>
                        </div>
                        <Badge 
                          variant="outline"
                          className={
                            tenant.paymentStatus === 'paid' ? 'bg-green-500/20 text-green-400' :
                            tenant.paymentStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }
                        >
                          {tenant.paymentStatus === 'paid' ? 'In Regola' : tenant.paymentStatus === 'pending' ? 'In Attesa' : 'Scaduto'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 pt-3 border-t border-white/10">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Saldo</p>
                          <p className={`font-semibold ${tenant.balance === 0 ? 'text-green-400' : 'text-yellow-400'}`}>
                            <SafeStats value={tenant.balance} prefix="€" />
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Consumo Acqua</p>
                          <div className="flex items-center gap-1">
                            <Droplet className="h-4 w-4 text-blue-400" />
                            <p className="font-semibold text-white">{tenant.usage.water} m³</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Consumo Energia</p>
                          <div className="flex items-center gap-1">
                            <Zap className="h-4 w-4 text-yellow-400" />
                            <p className="font-semibold text-white">{tenant.usage.electricity} kWh</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Apartments Tab */}
          <TabsContent value="apartments" className="space-y-6">
            <Card className="bg-[#1A1F26] border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Elenco Appartamenti</CardTitle>
                    <CardDescription>{apartments.length} unità totali</CardDescription>
                  </div>
                  <Button className="bg-[#1FA9A0] hover:bg-[#17978E]">
                    Aggiungi Appartamento
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {apartments.map((apt) => (
                    <div key={apt.id} className="p-4 bg-[#0E141B] rounded-lg border border-white/5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Home className="h-5 w-5 text-[#1FA9A0]" />
                            <p className="font-semibold text-white">{apt.unit}</p>
                            <Badge variant="outline" className="text-xs">
                              Piano {apt.floor}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-400">{apt.size} m²</p>
                        </div>
                        {apt.occupied ? (
                          <Badge className="bg-green-500/20 text-green-400">Occupato</Badge>
                        ) : (
                          <Badge className="bg-gray-500/20 text-gray-400">Libero</Badge>
                        )}
                      </div>
                      {apt.occupied && (
                        <div className="pt-3 border-t border-white/10">
                          <p className="text-xs text-gray-400 mb-1">Proprietario</p>
                          <p className="text-sm text-white">{apt.owner}</p>
                          {apt.tenant && apt.tenant !== apt.owner && (
                            <>
                              <p className="text-xs text-gray-400 mb-1 mt-2">Inquilino</p>
                              <p className="text-sm text-white">{apt.tenant}</p>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bills Tab */}
          <TabsContent value="bills" className="space-y-6">
            <Card className="bg-[#1A1F26] border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Fatturazione e Consumi</CardTitle>
                    <CardDescription>Gestione fatture e consumi per condòmino</CardDescription>
                  </div>
                  <Button className="bg-[#1FA9A0] hover:bg-[#17978E]">
                    Nuova Fattura
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tenants.map((tenant) => (
                    <div key={tenant.id} className="p-4 bg-[#0E141B] rounded-lg border border-white/5">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="font-semibold text-white">{tenant.name} {tenant.surname}</p>
                          <p className="text-sm text-gray-400">{tenant.apartment}</p>
                        </div>
                        <Badge 
                          variant="outline"
                          className={
                            tenant.paymentStatus === 'paid' ? 'bg-green-500/20 text-green-400' :
                            tenant.paymentStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }
                        >
                          {tenant.balance === 0 ? 'In Regola' : `Saldo: €${tenant.balance}`}
                        </Badge>
                      </div>
                      
                      {/* Usage Meters */}
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="p-3 bg-[#1A1F26] rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Droplet className="h-4 w-4 text-blue-400" />
                            <p className="text-xs text-gray-400">Acqua</p>
                          </div>
                          <p className="text-lg font-bold text-white">{tenant.usage.water} m³</p>
                          <p className="text-xs text-gray-500">€{(tenant.usage.water * 2.5).toFixed(2)}</p>
                        </div>
                        <div className="p-3 bg-[#1A1F26] rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Zap className="h-4 w-4 text-yellow-400" />
                            <p className="text-xs text-gray-400">Energia</p>
                          </div>
                          <p className="text-lg font-bold text-white">{tenant.usage.electricity} kWh</p>
                          <p className="text-xs text-gray-500">€{(tenant.usage.electricity * 0.25).toFixed(2)}</p>
                        </div>
                        <div className="p-3 bg-[#1A1F26] rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Flame className="h-4 w-4 text-orange-400" />
                            <p className="text-xs text-gray-400">Gas</p>
                          </div>
                          <p className="text-lg font-bold text-white">{tenant.usage.gas} m³</p>
                          <p className="text-xs text-gray-500">€{(tenant.usage.gas * 1.2).toFixed(2)}</p>
                        </div>
                      </div>

                      {/* Recent Bills */}
                      <div className="pt-3 border-t border-white/10">
                        <p className="text-sm font-medium text-white mb-2">Fatture Recenti</p>
                        <div className="space-y-2">
                          {bills.filter(b => b.tenant === `${tenant.name} ${tenant.surname}`).map((bill) => (
                            <div key={bill.id} className="flex items-center justify-between text-sm">
                              <div>
                                <p className="text-white">{bill.type} - {bill.period}</p>
                                <p className="text-xs text-gray-400">Scadenza: {bill.due}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-semibold text-white">€{bill.amount}</span>
                                <Badge 
                                  variant="outline"
                                  className={
                                    bill.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                                    bill.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                    'bg-red-500/20 text-red-400'
                                  }
                                >
                                  {bill.status === 'paid' ? 'Pagato' : bill.status === 'pending' ? 'In Attesa' : 'Scaduto'}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

