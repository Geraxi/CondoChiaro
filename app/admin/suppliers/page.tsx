'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Search, MapPin, Star, CheckCircle2, Filter, X, Building2, Phone, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { AssignJobDialog } from '@/components/suppliers/assign-job-dialog'

interface Supplier {
  id: string
  name: string
  categories: string[]
  rating: number
  total_reviews: number
  verified: boolean
  address: string | null
  city: string | null
  phone: string | null
  email: string | null
  logo_url: string | null
  distance_km: number | null
}

const CATEGORIES = [
  'idraulico',
  'elettricista',
  'manutenzione',
  'pulizie',
  'giardiniere',
  'elettricista',
  'riscaldamento',
]

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    category: 'all',
    verified: false,
    minRating: 0,
    radius: 10,
  })
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get user location (simplified - would use geolocation API)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        () => {
          // Fallback to default (Milan)
          setUserLocation({ lat: 45.4642, lng: 9.19 })
        }
      )
    } else {
      setUserLocation({ lat: 45.4642, lng: 9.19 })
    }
  }, [])

  useEffect(() => {
    if (userLocation) {
      searchSuppliers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation, filters])

  const searchSuppliers = async () => {
    if (!userLocation) return

    setLoading(true)
    setError(null)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        setError('Sessione scaduta. Effettua il login.')
        toast.error('Sessione scaduta')
        setLoading(false)
        return
      }

      const params = new URLSearchParams({
        lat: userLocation.lat.toString(),
        lng: userLocation.lng.toString(),
        radius: filters.radius.toString(),
      })

      if (filters.category && filters.category !== 'all') params.append('category', filters.category)
      if (filters.verified) params.append('verified', 'true')
      if (filters.minRating > 0) params.append('min_rating', filters.minRating.toString())

      const response = await fetch(`/api/suppliers/search?${params}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        setSuppliers(result.data.suppliers || [])
      } else {
        const errorMsg = result.error || 'Errore nella ricerca'
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } catch (error: any) {
      console.error('Search error:', error)
      const errorMsg = error.message || 'Errore nella ricerca fornitori'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleAssignJob = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setShowAssignDialog(true)
  }

  return (
    <div className="container mx-auto px-6 py-8 bg-[#0E141B] min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Fornitori nella tua zona</h1>
        <p className="text-gray-300">Trova e contatta professionisti per i tuoi condomini</p>
      </div>

      {/* Filters */}
      <Card className="bg-white/5 border-white/20 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">Categoria</label>
            <Select value={filters.category || 'all'} onValueChange={(value) => setFilters({ ...filters, category: value })}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Tutte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">Distanza</label>
            <Select
              value={filters.radius.toString()}
              onValueChange={(value) => setFilters({ ...filters, radius: parseInt(value) })}
            >
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 km</SelectItem>
                <SelectItem value="10">10 km</SelectItem>
                <SelectItem value="15">15 km</SelectItem>
                <SelectItem value="25">25 km</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm text-gray-200 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.verified}
                onChange={(e) => setFilters({ ...filters, verified: e.target.checked })}
                className="rounded border-white/20 bg-white/10"
              />
              Solo verificati
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">Valutazione min.</label>
            <Select
              value={filters.minRating.toString()}
              onValueChange={(value) => setFilters({ ...filters, minRating: parseFloat(value) })}
            >
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Tutte</SelectItem>
                <SelectItem value="3">3+ ⭐</SelectItem>
                <SelectItem value="4">4+ ⭐</SelectItem>
                <SelectItem value="4.5">4.5+ ⭐</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="bg-red-500/10 border-red-500/30 p-4 mb-6">
          <p className="text-red-400">{error}</p>
        </Card>
      )}

      {/* Suppliers Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin text-[#1FA9A0] text-4xl">⏳</div>
          <p className="text-gray-300 mt-4">Caricamento fornitori...</p>
        </div>
      ) : !userLocation ? (
        <Card className="bg-white/5 border-white/20 p-12 text-center">
          <p className="text-gray-300">Richiesta permesso geolocalizzazione...</p>
        </Card>
      ) : suppliers.length === 0 ? (
        <Card className="bg-white/5 border-white/20 p-12 text-center">
          <p className="text-gray-300 mb-4">Nessun fornitore trovato nella tua zona</p>
          <p className="text-sm text-gray-400 mb-4">
            {error
              ? 'Errore nella ricerca. Verifica che la tabella suppliers esista nel database.'
              : 'Prova ad espandere il raggio di ricerca o rimuovere i filtri.'}
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setFilters({ ...filters, radius: 25, category: 'all', verified: false, minRating: 0 })
              setError(null)
            }}
          >
            Espandi ricerca
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers.map((supplier) => (
            <motion.div
              key={supplier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full"
            >
              <Card className="bg-white/5 border-white/20 hover:border-[#1FA9A0]/40 transition h-full flex flex-col">
                <div className="p-6 flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {supplier.logo_url ? (
                        <Image src={supplier.logo_url} alt={supplier.name} width={48} height={48} className="w-12 h-12 rounded-lg object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-[#1FA9A0]/20 flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-[#1FA9A0]" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-white">{supplier.name}</h3>
                        {supplier.verified && (
                          <div className="flex items-center gap-1 text-xs text-[#1FA9A0] mt-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Verificato
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-medium">{supplier.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {supplier.categories.slice(0, 3).map((cat) => (
                        <span
                          key={cat}
                          className="text-xs px-2 py-1 rounded-full bg-[#1FA9A0]/20 text-[#1FA9A0]"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                    {supplier.address && (
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {supplier.address}
                          {supplier.city && `, ${supplier.city}`}
                        </span>
                      </div>
                    )}
                    {supplier.distance_km && (
                      <p className="text-xs text-gray-400 mt-1">~{supplier.distance_km.toFixed(1)} km</p>
                    )}
                  </div>

                  {supplier.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                      <Phone className="w-4 h-4" />
                      <span>{supplier.phone}</span>
                    </div>
                  )}
                  {supplier.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-300 mb-4">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{supplier.email}</span>
                    </div>
                  )}
                </div>

                <div className="p-6 pt-0 flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleAssignJob(supplier)}
                  >
                    Assegna intervento
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Contatta
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {showAssignDialog && selectedSupplier && (
        <AssignJobDialog
          supplier={selectedSupplier}
          open={showAssignDialog}
          onClose={() => {
            setShowAssignDialog(false)
            setSelectedSupplier(null)
          }}
          onSuccess={() => {
            setShowAssignDialog(false)
            setSelectedSupplier(null)
            toast.success('Intervento assegnato con successo')
          }}
        />
      )}
    </div>
  )
}

