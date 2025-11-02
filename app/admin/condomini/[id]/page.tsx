'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Building2, Users, Home, Euro, FileText, Wrench, Plus, Edit, Mail, Phone } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase, Condominium, Tenant, Apartment, Supplier, Document } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { AddTenantModal } from '@/components/condominiums/add-tenant-modal'
import { AddApartmentModal } from '@/components/condominiums/add-apartment-modal'
import { AddSupplierModal } from '@/components/condominiums/add-supplier-modal'
import { AddDocumentModal } from '@/components/condominiums/add-document-modal'

export default function CondominiumDetailPage() {
  const params = useParams()
  const condominiumId = params.id as string

  const [condominium, setCondominium] = useState<Condominium | null>(null)
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [apartments, setApartments] = useState<Apartment[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'tenants' | 'apartments' | 'documents' | 'suppliers'>('overview')
  const [showTenantModal, setShowTenantModal] = useState(false)
  const [showApartmentModal, setShowApartmentModal] = useState(false)
  const [showSupplierModal, setShowSupplierModal] = useState(false)
  const [showDocumentModal, setShowDocumentModal] = useState(false)

  useEffect(() => {
    if (condominiumId) {
      loadData()
    }
  }, [condominiumId])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load condominium
      const { data: condoData, error: condoError } = await supabase
        .from('condominiums')
        .select('*')
        .eq('id', condominiumId)
        .single()

      if (condoError) {
        // Handle missing table gracefully
        if (condoError.message?.includes('does not exist') || condoError.message?.includes('relation') || condoError.code === 'PGRST116') {
          setLoading(false)
          return
        }
        throw condoError
      }
      setCondominium(condoData)

      // Load tenants (ignore errors if table doesn't exist)
      try {
        const { data: tenantsData } = await supabase
          .from('tenants')
          .select('*')
          .eq('condominium_id', condominiumId)
          .order('created_at', { ascending: false })
        if (tenantsData) setTenants(tenantsData)
      } catch (e) {
        // Table might not exist yet
      }

      // Load apartments
      try {
        const { data: aptsData } = await supabase
          .from('apartments')
          .select('*')
          .eq('condominium_id', condominiumId)
          .order('unit_number', { ascending: true })
        if (aptsData) setApartments(aptsData)
      } catch (e) {
        // Table might not exist yet
      }

      // Load suppliers
      try {
        const { data: suppliersData } = await supabase
          .from('suppliers')
          .select('*')
          .eq('condominium_id', condominiumId)
          .order('created_at', { ascending: false })
        if (suppliersData) setSuppliers(suppliersData)
      } catch (e) {
        // Table might not exist yet
      }

      // Load documents
      try {
        const { data: docsData } = await supabase
          .from('documents')
          .select('*')
          .eq('condominium_id', condominiumId)
          .order('created_at', { ascending: false })
        if (docsData) setDocuments(docsData)
      } catch (e) {
        // Table might not exist yet
      }
    } catch (error: any) {
      console.error('Error loading data:', error)
      // Only show error if it's not a missing table error
      if (!error?.message?.includes('relation') && error?.code !== 'PGRST116') {
        toast.error('Errore nel caricamento dei dati')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    loadData()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-gray-400">Caricamento...</div>
      </div>
    )
  }

  if (!condominium) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Condominio non trovato</h2>
          <p className="text-gray-400">Il condominio richiesto non esiste o non hai i permessi per visualizzarlo.</p>
        </div>
      </div>
    )
  }

  const outstandingPayments = tenants.filter(t => t.payment_status !== 'paid').length
  const totalRevenue = tenants.reduce((sum, t) => sum + (t.payment_status === 'paid' ? 1 : 0), 0) * 500 // Example calculation

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{condominium.name}</h1>
          <p className="text-muted-foreground">{condominium.address}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/10">
          {[
            { id: 'overview' as const, label: 'Panoramica', icon: Building2 },
            { id: 'tenants' as const, label: 'Inquilini', icon: Users },
            { id: 'apartments' as const, label: 'Appartamenti', icon: Home },
            { id: 'documents' as const, label: 'Documenti', icon: FileText },
            { id: 'suppliers' as const, label: 'Fornitori', icon: Wrench }
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#1FA9A0] text-[#1FA9A0]'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-[#1A1F26] border-white/10">
                <CardHeader className="pb-2">
                  <CardDescription>Totale Inquilini</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{tenants.length}</div>
                </CardContent>
              </Card>
              <Card className="bg-[#1A1F26] border-white/10">
                <CardHeader className="pb-2">
                  <CardDescription>Totale Entrate Mensili</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">€{totalRevenue.toLocaleString('it-IT')}</div>
                </CardContent>
              </Card>
              <Card className="bg-[#1A1F26] border-white/10">
                <CardHeader className="pb-2">
                  <CardDescription>Pagamenti in Sospeso</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-400">{outstandingPayments}</div>
                </CardContent>
              </Card>
              <Card className="bg-[#1A1F26] border-white/10">
                <CardHeader className="pb-2">
                  <CardDescription>Unita Totali</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{apartments.length}</div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {activeTab === 'tenants' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Inquilini</h2>
              <Button
                onClick={() => setShowTenantModal(true)}
                className="bg-[#1FA9A0] hover:bg-[#17978E]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Aggiungi Inquilino
              </Button>
            </div>

            <Card className="bg-[#1A1F26] border-white/10">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold">Nome</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold">Telefono</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold">Appartamento</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold">Stato Pagamento</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenants.map((tenant) => {
                        const apartment = apartments.find(a => a.id === tenant.apartment_id)
                        return (
                          <tr key={tenant.id} className="border-t border-white/5 hover:bg-white/5">
                            <td className="px-6 py-4">
                              {tenant.name} {tenant.surname}
                            </td>
                            <td className="px-6 py-4 text-gray-400">{tenant.email}</td>
                            <td className="px-6 py-4 text-gray-400">{tenant.phone || '-'}</td>
                            <td className="px-6 py-4 text-gray-400">
                              {apartment ? `${apartment.unit_number} (Piano ${apartment.floor})` : '-'}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded text-xs ${
                                tenant.payment_status === 'paid'
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-orange-500/20 text-orange-400'
                              }`}>
                                {tenant.payment_status === 'paid' ? 'Pagato' : 'In attesa'}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  {tenants.length === 0 && (
                    <div className="p-12 text-center text-gray-400">
                      Nessun inquilino ancora. Aggiungi il primo!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'apartments' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Appartamenti</h2>
              <Button
                onClick={() => setShowApartmentModal(true)}
                className="bg-[#1FA9A0] hover:bg-[#17978E]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Aggiungi Appartamento
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {apartments.map((apartment) => {
                const tenant = tenants.find(t => t.apartment_id === apartment.id)
                return (
                  <Card key={apartment.id} className="bg-[#1A1F26] border-white/10">
                    <CardHeader>
                      <CardTitle>Appartamento {apartment.unit_number}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Piano:</span>
                          <span>{apartment.floor || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Interno:</span>
                          <span>{apartment.internal_number || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Metri Quadri:</span>
                          <span>{apartment.size_mq || '-'} m²</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Proprietario:</span>
                          <span>{tenant ? `${tenant.name} ${tenant.surname}` : 'Non assegnato'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
              {apartments.length === 0 && (
                <Card className="bg-[#1A1F26] border-white/10 col-span-full">
                  <CardContent className="p-12 text-center text-gray-400">
                    Nessun appartamento ancora. Aggiungi il primo!
                  </CardContent>
                </Card>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'documents' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Documenti</h2>
              <Button
                onClick={() => setShowDocumentModal(true)}
                className="bg-[#1FA9A0] hover:bg-[#17978E]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Carica Documento
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((document) => (
                <Card key={document.id} className="bg-[#1A1F26] border-white/10">
                  <CardHeader>
                    <CardTitle className="text-lg">{document.name}</CardTitle>
                    <CardDescription>{document.category}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <a
                      href={document.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1FA9A0] hover:underline text-sm"
                    >
                      Visualizza Documento →
                    </a>
                  </CardContent>
                </Card>
              ))}
              {documents.length === 0 && (
                <Card className="bg-[#1A1F26] border-white/10 col-span-full">
                  <CardContent className="p-12 text-center text-gray-400">
                    Nessun documento ancora. Carica il primo!
                  </CardContent>
                </Card>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'suppliers' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Fornitori</h2>
              <Button
                onClick={() => setShowSupplierModal(true)}
                className="bg-[#1FA9A0] hover:bg-[#17978E]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Aggiungi Fornitore
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suppliers.map((supplier) => (
                <Card key={supplier.id} className="bg-[#1A1F26] border-white/10">
                  <CardHeader>
                    <CardTitle>{supplier.name}</CardTitle>
                    <CardDescription>{supplier.service_type}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {supplier.email && (
                        <div className="flex items-center gap-2 text-gray-400">
                          <Mail className="w-4 h-4" />
                          {supplier.email}
                        </div>
                      )}
                      {supplier.phone && (
                        <div className="flex items-center gap-2 text-gray-400">
                          <Phone className="w-4 h-4" />
                          {supplier.phone}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {suppliers.length === 0 && (
                <Card className="bg-[#1A1F26] border-white/10 col-span-full">
                  <CardContent className="p-12 text-center text-gray-400">
                    Nessun fornitore ancora. Aggiungi il primo!
                  </CardContent>
                </Card>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Modals */}
      {showTenantModal && (
        <AddTenantModal
          condominiumId={condominiumId}
          apartments={apartments}
          onClose={() => setShowTenantModal(false)}
          onSuccess={handleRefresh}
        />
      )}
      {showApartmentModal && (
        <AddApartmentModal
          condominiumId={condominiumId}
          onClose={() => setShowApartmentModal(false)}
          onSuccess={handleRefresh}
        />
      )}
      {showSupplierModal && (
        <AddSupplierModal
          condominiumId={condominiumId}
          onClose={() => setShowSupplierModal(false)}
          onSuccess={handleRefresh}
        />
      )}
      {showDocumentModal && (
        <AddDocumentModal
          condominiumId={condominiumId}
          onClose={() => setShowDocumentModal(false)}
          onSuccess={handleRefresh}
        />
      )}
    </div>
  )
}

