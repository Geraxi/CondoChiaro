'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sparkles, FileText, Download, Calendar, CheckCircle } from 'lucide-react'
import { GenerateSummaryModal } from '@/components/assemblies/generate-summary-modal'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { Badge } from '@/components/ui/badge'

export default function AssemblyDetailPage() {
  const params = useParams()
  const assemblyId = params?.id as string
  const [assembly, setAssembly] = useState<any>(null)
  const [summaries, setSummaries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showSummaryModal, setShowSummaryModal] = useState(false)

  useEffect(() => {
    if (assemblyId) {
      loadAssembly()
      loadSummaries()
    }
  }, [assemblyId])

  const loadAssembly = async () => {
    try {
      const { data, error } = await supabase
        .from('assemblies')
        .select('*')
        .eq('id', assemblyId)
        .single()

      if (error) {
        // Try documents table as fallback
        const { data: doc } = await supabase
          .from('documents')
          .select('*')
          .eq('id', assemblyId)
          .eq('type', 'verbale')
          .single()

        if (doc) {
          setAssembly({
            id: doc.id,
            title: doc.title,
            notes: doc.description,
            meeting_date: doc.created_at,
          })
        }
      } else {
        setAssembly(data)
      }
    } catch (error: any) {
      console.error('Error loading assembly:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSummaries = async () => {
    try {
      const { data, error } = await supabase
        .from('assembly_summaries')
        .select('*')
        .eq('assembly_id', assemblyId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setSummaries(data || [])
    } catch (error: any) {
      console.error('Error loading summaries:', error)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center text-gray-400">Caricamento...</div>
      </div>
    )
  }

  if (!assembly) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center text-red-400">Assemblea non trovata</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-white">{assembly.title || 'Assemblea'}</h1>
          <p className="text-gray-300">
            {assembly.meeting_date ? new Date(assembly.meeting_date).toLocaleDateString('it-IT') : ''}
          </p>
        </div>
        <Button
          onClick={() => setShowSummaryModal(true)}
          className="bg-[#1FA9A0] hover:bg-[#17978E]"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Genera Verbale Sintetico
        </Button>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-[#1A1F26]">
          <TabsTrigger value="details">Dettagli</TabsTrigger>
          <TabsTrigger value="summaries">Verbali Sintetici</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card className="bg-[#1A1F26] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Informazioni Assemblea</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assembly.notes && (
                  <div>
                    <p className="text-sm font-medium text-gray-400 mb-2">Note</p>
                    <p className="text-white">{assembly.notes}</p>
                  </div>
                )}
                {assembly.description && (
                  <div>
                    <p className="text-sm font-medium text-gray-400 mb-2">Descrizione</p>
                    <p className="text-white">{assembly.description}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summaries">
          <div className="space-y-4">
            {summaries.length === 0 ? (
              <Card className="bg-[#1A1F26] border-white/10">
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">Nessun verbale sintetico ancora</p>
                  <Button
                    onClick={() => setShowSummaryModal(true)}
                    className="bg-[#1FA9A0] hover:bg-[#17978E]"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Genera Primo Verbale
                  </Button>
                </CardContent>
              </Card>
            ) : (
              summaries.map((summary) => (
                <Card key={summary.id} className="bg-[#1A1F26] border-white/10">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-white flex items-center gap-2">
                          <FileText className="h-5 w-5 text-[#1FA9A0]" />
                          Verbale Sintetico
                        </CardTitle>
                        <CardDescription>
                          {new Date(summary.created_at).toLocaleDateString('it-IT', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {summary.approved ? (
                          <Badge className="bg-green-500/20 text-green-400">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approvato
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400">
                            Bozza
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-400 mb-2">Riassunto</p>
                        <p className="text-white whitespace-pre-wrap">{summary.summary_text}</p>
                      </div>
                      <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Scarica PDF
                        </Button>
                        {!summary.approved && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-[#1FA9A0]/50 hover:bg-[#1FA9A0]/10"
                            onClick={() => {
                              // Approve summary
                              handleApproveSummary(summary.id)
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approva
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      <GenerateSummaryModal
        assemblyId={assemblyId}
        isOpen={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
        onSuccess={() => {
          loadSummaries()
          toast.success('Verbale sintetico generato!')
        }}
      />
    </div>
  )

  async function handleApproveSummary(summaryId: string) {
    try {
      const { error } = await supabase
        .from('assembly_summaries')
        .update({ approved: true })
        .eq('id', summaryId)

      if (error) throw error
      toast.success('Verbale approvato!')
      loadSummaries()
    } catch (error: any) {
      console.error('Error approving summary:', error)
      toast.error('Errore nell\'approvazione')
    }
  }
}



