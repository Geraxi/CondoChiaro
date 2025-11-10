'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, MapPin, Users, FileText, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DemoAdminAssemblies() {
  return (
    <div className="min-h-screen bg-[#0E141B]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-white">Assemblee - Demo</h1>
            <p className="text-gray-300">Visualizzazione demo delle assemblee condominiali</p>
          </div>
          <Button className="bg-[#1FA9A0] hover:bg-[#17978E]">
            Nuova Assemblea
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { 
              date: '20 Feb 2024', 
              time: '18:00', 
              location: 'Sala Condominiale', 
              agenda: 'Approvazione bilancio 2023', 
              attendees: '45/60',
              status: 'completed',
              hasSummary: true
            },
            { 
              date: '15 Mar 2024', 
              time: '19:00', 
              location: 'Online', 
              agenda: 'Rinnovo assicurazione', 
              attendees: 'Pianificata',
              status: 'scheduled',
              hasSummary: false
            },
          ].map((assembly, idx) => (
            <Card key={idx} className="bg-[#1A1F26] border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Calendar className="h-5 w-5 text-[#1FA9A0]" />
                  Assemblea {assembly.date}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-300">{assembly.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-300">{assembly.location}</span>
                  </div>
                  <div className="pt-3 border-t border-white/10">
                    <p className="text-sm font-medium mb-1 text-white">Ordine del giorno:</p>
                    <p className="text-sm text-gray-300">{assembly.agenda}</p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-300">{assembly.attendees}</span>
                    </div>
                    {assembly.hasSummary && (
                      <Button variant="outline" size="sm" className="border-[#1FA9A0]/50">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Verbale Sintetico
                      </Button>
                    )}
                    {assembly.status === 'completed' && (
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        Visualizza Verbale
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}



