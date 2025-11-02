'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Building2, Plus, Users, Home, Euro, ArrowRight, Upload } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase, Condominium } from '@/lib/supabase'
import Link from 'next/link'
import { AddCondominiumModal } from './add-condominium-modal'
import toast from 'react-hot-toast'
import Image from 'next/image'

export function CondominiumsGrid() {
  const [condominiums, setCondominiums] = useState<Condominium[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    loadCondominiums()
  }, [])

  const loadCondominiums = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        // No user - show empty state
        setCondominiums([])
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('condominiums')
        .select('*')
        .eq('admin_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        // If error is about missing table, just show empty state
        if (error.message?.includes('does not exist') || error.message?.includes('relation') || error.code === 'PGRST116') {
          setCondominiums([])
          setLoading(false)
          return
        }
        throw error
      }
      setCondominiums(data || [])
    } catch (error: any) {
      console.error('Error loading condominiums:', error)
      // Don't show error toast if it's a database connection issue
      if (error?.message?.includes('relation') || error?.code === 'PGRST116') {
        setCondominiums([])
      } else {
        toast.error('Errore nel caricamento dei condomini')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCondominiumAdded = () => {
    loadCondominiums()
    setShowModal(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400">Caricamento...</div>
      </div>
    )
  }

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">I miei Condomini</h2>
            <p className="text-muted-foreground">
              Gestisci tutti i tuoi condomini da un'unica dashboard
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/migration">
              <Button variant="outline" className="bg-white/5 border-white/10">
                <Upload className="w-4 h-4 mr-2" />
                Importa Dati
              </Button>
            </Link>
            <Button
              onClick={() => setShowModal(true)}
              className="bg-[#1FA9A0] hover:bg-[#17978E]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Aggiungi Condominio
            </Button>
          </div>
        </div>

        {condominiums.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nessun condominio ancora</h3>
              <p className="text-gray-400 mb-6 text-center">
                Inizia aggiungendo il tuo primo condominio o importa i dati esistenti
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowModal(true)}
                  className="bg-[#1FA9A0] hover:bg-[#17978E]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Aggiungi Condominio
                </Button>
                <Link href="/admin/migration">
                  <Button variant="outline" className="bg-white/5 border-white/10">
                    <Upload className="w-4 h-4 mr-2" />
                    Importa Dati
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {condominiums.map((condominium, idx) => (
              <motion.div
                key={condominium.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="hover:border-[#1FA9A0]/30 transition-all cursor-pointer group h-full">
                  <CardHeader>
                    <div className="relative h-48 mb-4 rounded-lg overflow-hidden bg-gradient-to-br from-[#1FA9A0]/20 to-[#27C5B9]/20">
                      {condominium.image_url ? (
                        <Image
                          src={condominium.image_url}
                          alt={condominium.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 className="w-16 h-16 text-[#1FA9A0]" />
                        </div>
                      )}
                    </div>
                    <CardTitle className="text-xl group-hover:text-[#1FA9A0] transition-colors">
                      {condominium.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Building2 className="w-4 h-4" />
                        <span>{condominium.address || 'Indirizzo non specificato'}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Home className="w-4 h-4 text-[#1FA9A0]" />
                          <span className="text-gray-300">{condominium.units_count || 0}</span>
                          <span className="text-gray-400">unità</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-[#1FA9A0]" />
                          <span className="text-gray-300">{condominium.total_tenants || 0}</span>
                          <span className="text-gray-400">condòmini</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Euro className="w-4 h-4 text-[#1FA9A0]" />
                        <span className="text-gray-300">
                          €{condominium.monthly_revenue?.toLocaleString('it-IT') || '0'}
                        </span>
                        <span className="text-gray-400">mensili</span>
                      </div>
                    </div>
                    <Link href={`/admin/condomini/${condominium.id}`}>
                      <Button className="w-full bg-[#1FA9A0] hover:bg-[#17978E] group-hover:bg-[#27C5B9] transition-colors">
                        Apri Condominio
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <AddCondominiumModal
          onClose={() => setShowModal(false)}
          onSuccess={handleCondominiumAdded}
        />
      )}
    </>
  )
}

