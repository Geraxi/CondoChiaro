'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Calendar, MapPin, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'

export default function AdminAssemblies() {
  const [assemblies, setAssemblies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAssemblies()
  }, [])

  const loadAssemblies = async () => {
    try {
      // Try to load from assemblies table, fallback to documents
      const { data, error } = await supabase
        .from('assemblies')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        // Fallback to documents with type 'verbale'
        const { data: docs } = await supabase
          .from('documents')
          .select('*')
          .eq('type', 'verbale')
          .order('created_at', { ascending: false })
          .limit(10)

        if (docs) {
          setAssemblies(docs.map(doc => ({
            id: doc.id,
            title: doc.title,
            meeting_date: doc.created_at,
            location: 'Sala Condominiale',
            agenda: doc.description,
          })))
        }
      } else {
        setAssemblies(data || [])
      }
    } catch (error: any) {
      console.error('Error loading assemblies:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center text-gray-400">Caricamento...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-white">Assemblee</h1>
          <p className="text-gray-300">Gestione e organizzazione delle assemblee condominiali</p>
        </div>
        <Button className="bg-[#1FA9A0] hover:bg-[#17978E]">Nuova Assemblea</Button>
      </div>

      {assemblies.length === 0 ? (
        <Card className="bg-[#1A1F26] border-white/10">
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">Nessuna assemblea ancora</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assemblies.map((assembly) => (
            <Card key={assembly.id} className="bg-[#1A1F26] border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Calendar className="h-5 w-5 text-[#1FA9A0]" />
                  {assembly.title || `Assemblea ${new Date(assembly.meeting_date || assembly.created_at).toLocaleDateString('it-IT')}`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {assembly.meeting_date && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-300">
                        {new Date(assembly.meeting_date).toLocaleDateString('it-IT')}
                      </span>
                    </div>
                  )}
                  {assembly.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-300">{assembly.location}</span>
                    </div>
                  )}
                  {assembly.agenda && (
                    <div className="pt-3 border-t border-white/10">
                      <p className="text-sm font-medium mb-1 text-white">Ordine del giorno:</p>
                      <p className="text-sm text-gray-300">{assembly.agenda}</p>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <Link href={`/admin/assemblies/${assembly.id}`}>
                      <Button variant="outline" size="sm" className="border-[#1FA9A0]/50 hover:bg-[#1FA9A0]/10">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Dettagli
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
