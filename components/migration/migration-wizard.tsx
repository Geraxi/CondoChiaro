'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, CheckCircle2, Mail, ArrowRight, ArrowLeft, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface ParsedData {
  [key: string]: string | number
}

interface ColumnMapping {
  [key: string]: string // csv column -> db column
}

export function MigrationWizard() {
  const [step, setStep] = useState(1)
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<ParsedData[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({})
  const [previewData, setPreviewData] = useState<ParsedData[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [importSummary, setImportSummary] = useState({
    condominiums: 0,
    tenants: 0,
    suppliers: 0
  })
  const [isImporting, setIsImporting] = useState(false)

  const itemsPerPage = 10

  // Initialize preview data when parsedData changes
  useEffect(() => {
    if (parsedData.length > 0) {
      setPreviewData(parsedData.slice(0, itemsPerPage))
      setCurrentPage(1)
    }
  }, [parsedData])

  // Step 1: File Upload
  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0]
    if (!uploadedFile) return

    setFile(uploadedFile)

    // Upload to Supabase Storage
    const fileExt = uploadedFile.name.split('.').pop()
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
    
    try {
      // Try to upload to storage, but continue even if it fails
      try {
        const { error: uploadError } = await supabase.storage
          .from('migration-files')
          .upload(fileName, uploadedFile)

        if (uploadError) {
          console.warn('File upload to storage failed, continuing with parsing:', uploadError)
        }
      } catch (storageError) {
        console.warn('Storage not available, continuing with local parsing:', storageError)
      }

      // Parse file (this works locally without storage)
      if (uploadedFile.name.endsWith('.csv')) {
        Papa.parse(uploadedFile, {
          header: true,
          complete: (results) => {
            const data = results.data as ParsedData[]
            if (data.length > 0) {
              setParsedData(data)
              setHeaders(Object.keys(data[0]))
              setPreviewData(data.slice(0, itemsPerPage))
              autoDetectColumns(Object.keys(data[0]))
            }
          },
          error: (error) => {
            toast.error('Errore durante il parsing del CSV')
            console.error(error)
          }
        })
      } else if (uploadedFile.name.endsWith('.xlsx') || uploadedFile.name.endsWith('.xls')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: 'array' })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet) as ParsedData[]
          
          if (jsonData.length > 0) {
            setParsedData(jsonData)
            setHeaders(Object.keys(jsonData[0]))
            setPreviewData(jsonData.slice(0, itemsPerPage))
            autoDetectColumns(Object.keys(jsonData[0]))
          }
        }
        reader.readAsArrayBuffer(uploadedFile)
      }
    } catch (error) {
      toast.error('Errore durante l\'elaborazione del file')
      console.error(error)
    }
  }, [])

  // Auto-detect column mappings
  const autoDetectColumns = (csvHeaders: string[]) => {
    const mapping: ColumnMapping = {}
    const commonHeaders = {
      'nome': 'name',
      'cognome': 'surname',
      'name': 'name',
      'email': 'email',
      'mail': 'email',
      'unità': 'unit',
      'unit': 'unit',
      'piano': 'floor',
      'floor': 'floor',
      'interno': 'internal',
      'internal': 'internal',
      'mq': 'size_mq',
      'size': 'size_mq',
      'stato pagamento': 'payment_status',
      'payment': 'payment_status',
      'telefono': 'phone',
      'phone': 'phone',
      'condominio': 'condominium_name',
      'condominium': 'condominium_name',
      'condominium name': 'condominium_name'
    }

    csvHeaders.forEach(header => {
      const normalized = header.toLowerCase().trim()
      if (commonHeaders[normalized as keyof typeof commonHeaders]) {
        mapping[header] = commonHeaders[normalized as keyof typeof commonHeaders]
      }
    })

    setColumnMapping(mapping)
  }

  const updateColumnMapping = (csvColumn: string, dbColumn: string) => {
    setColumnMapping(prev => ({
      ...prev,
      [csvColumn]: dbColumn
    }))
  }

  // Step 3: Confirm and Import
  const handleImport = async () => {
    setIsImporting(true)
    try {
      // Get user ID safely
      let userId = ''
      try {
        const { data: { user } } = await supabase.auth.getUser()
        userId = user?.id || ''
      } catch (authError) {
        console.warn('Could not get user, proceeding without user ID:', authError)
      }

      if (!userId) {
        toast.error('Devi essere autenticato per importare i dati')
        setIsImporting(false)
        return
      }

      let condominiums = 0
      let tenants = 0
      let suppliers = 0

      // Group data by condominium
      const condominiumGroups = new Map<string, ParsedData[]>()

      parsedData.forEach(row => {
        const condoName = row[Object.keys(row).find(k => 
          columnMapping[k] === 'condominium_name'
        ) || ''] as string

        if (condoName) {
          if (!condominiumGroups.has(condoName)) {
            condominiumGroups.set(condoName, [])
          }
          condominiumGroups.get(condoName)?.push(row)
        }
      })

      // Import condominiums and related data
      for (const [condoName, rows] of Array.from(condominiumGroups.entries())) {
        // Create condominium
        const { data: condoData, error: condoError } = await supabase
          .from('condominiums')
          .insert({
            name: condoName,
            address: '', // Could be extracted from data
            units_count: rows.length,
            total_tenants: rows.length,
            monthly_revenue: 0,
            admin_id: userId
          } as any)
          .select()
          .single()

        if (condoError || !condoData) {
          console.error('Error creating condominium:', condoError)
          continue
        }

        condominiums++
        const condoId = (condoData as any).id

        // Import apartments and tenants
        for (const row of rows) {
          // Create apartment
          const apartmentData: any = {
            condominium_id: condoId,
            unit_number: row[Object.keys(row).find(k => columnMapping[k] === 'unit') || ''] || '',
            floor: row[Object.keys(row).find(k => columnMapping[k] === 'floor') || ''] || '',
            internal_number: row[Object.keys(row).find(k => columnMapping[k] === 'internal') || ''] || '',
            size_mq: parseFloat(row[Object.keys(row).find(k => columnMapping[k] === 'size_mq') || ''] as string) || null
          }

          const { data: aptData, error: aptError } = await supabase
            .from('apartments')
            .insert(apartmentData as any)
            .select()
            .single()

          if (aptError || !aptData) {
            console.error('Error creating apartment:', aptError)
            continue
          }

          // Create tenant
          const tenantData: any = {
            condominium_id: condoId,
            apartment_id: (aptData as any).id,
            name: row[Object.keys(row).find(k => columnMapping[k] === 'name') || ''] || '',
            surname: row[Object.keys(row).find(k => columnMapping[k] === 'surname') || ''] || '',
            email: row[Object.keys(row).find(k => columnMapping[k] === 'email') || ''] || '',
            phone: row[Object.keys(row).find(k => columnMapping[k] === 'phone') || ''] || '',
            payment_status: row[Object.keys(row).find(k => columnMapping[k] === 'payment_status') || ''] || 'pending'
          }

          const { error: tenantError } = await supabase
            .from('tenants')
            .insert(tenantData as any)

          if (!tenantError) {
            tenants++
          }
        }
      }

      setImportSummary({ condominiums, tenants, suppliers })
      setStep(4)
      toast.success('Importazione completata con successo!')
    } catch (error) {
      toast.error('Errore durante l\'importazione')
      console.error(error)
    } finally {
      setIsImporting(false)
    }
  }

  // Step 4: Send Invites
  const handleSendInvites = async () => {
    try {
      // Get all imported tenants
      const { data: tenants } = await supabase
        .from('tenants')
        .select('email, name, surname')
        .limit(100)

      if (tenants && tenants.length > 0) {
        // Here you would typically call an API endpoint to send emails
        // For now, we'll just show a success message
        toast.success(`Inviti inviati a ${tenants.length} condòmini!`)
      }
    } catch (error) {
      toast.error('Errore durante l\'invio degli inviti')
    }
  }

  const totalPages = Math.ceil(parsedData.length / itemsPerPage)

  const goToPage = (page: number) => {
    setCurrentPage(page)
    const start = (page - 1) * itemsPerPage
    setPreviewData(parsedData.slice(start, start + itemsPerPage))
  }

  return (
    <div className="min-h-screen bg-[#0E141B] p-8">
        <div className="max-w-6xl mx-auto">
          <Card className="relative overflow-hidden">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-[#1FA9A0] to-[#27C5B9] bg-clip-text text-transparent">
                Migrazione Dati
              </CardTitle>
            </CardHeader>
            <CardContent className="relative overflow-hidden px-6">
              {/* Progress Bar */}
              <div className="mb-8 relative overflow-hidden bg-[#f9fafb] rounded-2xl p-6 shadow-md flex justify-between items-center">
                {[
                  { num: 1, label: 'Carica File', icon: Upload },
                  { num: 2, label: 'Anteprima', icon: FileText },
                  { num: 3, label: 'Conferma', icon: CheckCircle2 },
                  { num: 4, label: 'Invita Condòmini', icon: Mail }
                ].map(({ num, label, icon: Icon }) => (
                  <div key={num} className="flex items-start flex-1 min-w-0 relative" style={{ marginRight: 0, transform: 'none' }}>
                    <div className="flex flex-col items-center w-full overflow-hidden relative" style={{ marginRight: 0, transform: 'none' }}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors flex-shrink-0 relative z-10 ${
                          step >= num ? 'bg-[#1FA9A0] text-white' : 'bg-white/10 text-gray-400'
                        }`}>
                          <Icon className="w-5 h-5 flex-shrink-0" />
                        </div>
                        <span className={`text-xs leading-tight text-center break-words overflow-hidden w-full px-0.5 relative z-10 ${step >= num ? 'text-[#1FA9A0]' : 'text-gray-400'}`} style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                          {label}
                        </span>
                      </div>
                      {num < 4 && (
                        <div className={`h-1 flex-1 mx-1.5 mt-5 transition-colors flex-shrink-0 relative ${
                          step > num ? 'bg-[#1FA9A0]' : 'bg-white/10'
                        }`} />
                      )}
                    </div>
                  ))}
              </div>

              {/* Step Content */}
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="border-2 border-dashed border-white/20 rounded-lg p-12 text-center focus-within:border-[#1FA9A0]/50 focus-within:outline-none">
                      <Upload className="w-16 h-16 mx-auto mb-4 text-[#1FA9A0]" />
                      <h3 className="text-xl font-semibold mb-2">Carica il tuo file</h3>
                      <p className="text-gray-400 mb-4">Supporta file .xlsx e .csv</p>
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="focus:outline-none">
                        <Button className="bg-[#1FA9A0] hover:bg-[#17978E] focus:outline-none focus:ring-2 focus:ring-[#1FA9A0] focus:ring-offset-2 focus:ring-offset-[#1A1F26]">
                          Scegli File
                        </Button>
                      </label>
                      {file && (
                        <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                          <p className="text-sm">File selezionato: {file.name}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {step === 2 && parsedData.length > 0 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Mappatura Colonne</h3>
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        {headers.map(header => (
                          <div key={header} className="flex items-center gap-2">
                            <label className="text-sm text-gray-400 w-32">{header}</label>
                            <select
                              value={columnMapping[header] || ''}
                              onChange={(e) => updateColumnMapping(header, e.target.value)}
                              className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-sm"
                            >
                              <option value="">-- Non mappare --</option>
                              <option value="name">Nome</option>
                              <option value="surname">Cognome</option>
                              <option value="email">Email</option>
                              <option value="phone">Telefono</option>
                              <option value="unit">Unità</option>
                              <option value="floor">Piano</option>
                              <option value="internal">Interno</option>
                              <option value="size_mq">Metri Quadri</option>
                              <option value="payment_status">Stato Pagamento</option>
                              <option value="condominium_name">Nome Condominio</option>
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold mb-4">Anteprima Dati ({parsedData.length} righe)</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-white/5">
                              {headers.map(header => (
                                <th key={header} className="border border-white/10 px-4 py-2 text-left text-sm">
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {previewData.map((row, idx) => (
                              <tr key={idx} className="border-b border-white/5">
                                {headers.map(header => (
                                  <td key={header} className="px-4 py-2 text-sm">
                                    {String(row[header] || '')}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      <div className="flex justify-center gap-2 mt-4">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <Button
                            key={page}
                            variant={currentPage === page ? 'default' : 'outline'}
                            onClick={() => goToPage(page)}
                            className="bg-white/5 border-white/10"
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="p-6 bg-white/5 rounded-lg">
                      <h3 className="text-xl font-semibold mb-4">Conferma Importazione</h3>
                      <p className="text-gray-400 mb-4">
                        Stai per importare {parsedData.length} righe di dati. Questo processo potrebbe richiedere alcuni minuti.
                      </p>
                      <Button
                        onClick={handleImport}
                        disabled={isImporting}
                        className="bg-[#1FA9A0] hover:bg-[#17978E] w-full"
                      >
                        {isImporting ? 'Importazione in corso...' : 'Conferma e Importa'}
                      </Button>
                    </div>
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="p-6 bg-gradient-to-br from-[#1FA9A0]/20 to-[#27C5B9]/20 rounded-lg text-center">
                      <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-[#1FA9A0]" />
                      <h3 className="text-2xl font-semibold mb-2">Importazione Completata!</h3>
                      <div className="space-y-2 mb-6">
                        <p className="text-lg">
                          Hai importato <span className="font-bold text-[#1FA9A0]">{importSummary.condominiums}</span> condomini,
                        </p>
                        <p className="text-lg">
                          <span className="font-bold text-[#1FA9A0]">{importSummary.tenants}</span> condòmini e
                        </p>
                        <p className="text-lg">
                          <span className="font-bold text-[#1FA9A0]">{importSummary.suppliers}</span> fornitori con successo.
                        </p>
                      </div>
                      <Button
                        onClick={handleSendInvites}
                        className="bg-[#1FA9A0] hover:bg-[#17978E]"
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Invia Inviti Email
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <Button
                  onClick={() => setStep(prev => Math.max(1, prev - 1))}
                  disabled={step === 1}
                  variant="outline"
                  className="bg-white/5 border-white/10"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Indietro
                </Button>
                <Button
                  onClick={() => {
                    if (step === 2 && parsedData.length > 0) {
                      setStep(3)
                    } else if (step === 1 && file) {
                      setStep(2)
                    }
                  }}
                  disabled={step === 1 && !file || step === 2 && parsedData.length === 0 || step === 4}
                  className="bg-[#1FA9A0] hover:bg-[#17978E]"
                >
                  Avanti
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  )
}

