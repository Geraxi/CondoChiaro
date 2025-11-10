'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Star, MapPin, Phone } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function DemoAdminSuppliers() {
  return (
    <div className="min-h-screen bg-[#0E141B]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-white">Fornitori - Demo</h1>
          <p className="text-gray-300">Visualizzazione demo dei fornitori nella tua zona</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { 
              name: 'Idraulico Mario Rossi', 
              category: 'Idraulico', 
              rating: 4.8, 
              reviews: 24, 
              distance: '2.5 km',
              verified: true
            },
            { 
              name: 'Elettricista Verdi & C.', 
              category: 'Elettricista', 
              rating: 4.5, 
              reviews: 18, 
              distance: '5.1 km',
              verified: true
            },
            { 
              name: 'Manutenzione Ascensori SRL', 
              category: 'Ascensori', 
              rating: 4.9, 
              reviews: 45, 
              distance: '8.3 km',
              verified: true
            },
          ].map((supplier, idx) => (
            <Card key={idx} className="bg-[#1A1F26] border-white/10">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Building2 className="h-6 w-6 text-[#1FA9A0]" />
                  {supplier.verified && (
                    <Badge className="bg-green-500/20 text-green-400">Verificato</Badge>
                  )}
                </div>
                <CardTitle className="text-white">{supplier.name}</CardTitle>
                <CardDescription>{supplier.category}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-white font-semibold">{supplier.rating}</span>
                    <span className="text-gray-400 text-sm">({supplier.reviews} recensioni)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <MapPin className="h-4 w-4" />
                    <span>{supplier.distance} di distanza</span>
                  </div>
                  <Button className="w-full bg-[#1FA9A0] hover:bg-[#17978E] mt-4">
                    Assegna Intervento
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}



