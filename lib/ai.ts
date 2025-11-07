/**
 * AI Integration for CondoChiaro
 * - Document summarization (OpenAI)
 * - AI Assistant queries (vector search + OpenAI)
 */

import OpenAI from 'openai'
import { supabase } from './supabase'

const openaiClient = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null

/**
 * Summarize a document (PDF, text) using OpenAI
 */
export async function summarizeDocument(
  content: string,
  options?: { maxLength?: number; language?: string }
): Promise<{ summary: string; error?: string }> {
  if (!process.env.OPENAI_API_KEY) {
    return {
      summary: '',
      error: 'OPENAI_API_KEY not configured',
    }
  }

  try {
    const maxLength = options?.maxLength || 300
    const language = options?.language || 'italiano'

    const response = await openaiClient!.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Sei un assistente specializzato nella sintesi di documenti condominiali. Crea riassunti chiari e concisi in ${language}, evidenziando punti chiave, decisioni prese, scadenze e informazioni finanziarie.`,
        },
        {
          role: 'user',
          content: `Riassumi il seguente documento in massimo ${maxLength} parole, mantenendo tutte le informazioni importanti:\n\n${content.substring(0, 15000)}`, // Limit content to avoid token limits
        },
      ],
      temperature: 0.3,
      max_tokens: Math.ceil(maxLength * 1.5), // Allow some buffer
    })

    const summary = response.choices[0]?.message?.content || ''
    return { summary }
  } catch (error: any) {
    console.error('Document summarization failed:', error)
    return {
      summary: '',
      error: error.message || 'Failed to generate summary',
    }
  }
}

/**
 * Extract text from PDF (if needed, using a PDF parsing library)
 * For now, this is a placeholder - you'll need to integrate pdf-parse or similar
 */
export async function extractTextFromPDF(fileUrl: string): Promise<{ text: string; error?: string }> {
  try {
    // Download PDF from Supabase storage
    const { data, error } = await supabase.storage
      .from('documents')
      .download(fileUrl)

    if (error) {
      return { text: '', error: error.message }
    }

    // TODO: Implement PDF text extraction
    // You'll need to install: npm install pdf-parse
    // For now, return placeholder
    return {
      text: '',
      error: 'PDF text extraction not yet implemented. Install pdf-parse to enable.',
    }
  } catch (error: any) {
    return { text: '', error: error.message }
  }
}

/**
 * Process AI Assistant query (Ask CondoChiaro)
 */
export async function processAIQuery(
  query: string,
  userId: string,
  context?: {
    condominiumId?: string
    role?: 'admin' | 'tenant' | 'supplier'
  }
): Promise<{ answer: string; sources?: string[]; error?: string }> {
  if (!process.env.OPENAI_API_KEY) {
    return {
      answer: 'Il servizio AI non è attualmente disponibile. Configura OPENAI_API_KEY per abilitarlo.',
      error: 'OPENAI_API_KEY not configured',
    }
  }

  try {
    // Gather relevant context from database
    const contextData = await gatherContextForQuery(userId, query, context)

    const systemPrompt = `Sei CondoChiaro AI, un assistente esperto nella gestione condominiale italiana. 
Rispondi sempre in italiano, in modo chiaro e professionale.
Usa i dati forniti nel contesto per dare risposte accurate.
Se non hai informazioni sufficienti, dillo onestamente.`

    const userPrompt = `Domanda: "${query}"

Contesto disponibile:
${JSON.stringify(contextData, null, 2)}

Fornisci una risposta precisa e utile basata sul contesto fornito.`

    const response = await openaiClient!.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.5,
      max_tokens: 500,
    })

    const answer = response.choices[0]?.message?.content || 'Non sono riuscito a generare una risposta.'
    return { answer, sources: contextData.sources || [] }
  } catch (error: any) {
    console.error('AI query processing failed:', error)
    return {
      answer: 'Mi dispiace, si è verificato un errore durante l\'elaborazione della tua richiesta.',
      error: error.message,
    }
  }
}

/**
 * Gather relevant context from database for AI query
 */
async function gatherContextForQuery(
  userId: string,
  query: string,
  context?: { condominiumId?: string; role?: string }
): Promise<{ data: any; sources: string[] }> {
  const sources: string[] = []
  const data: any = {}

  try {
    // Get admin info
    const { data: admin } = await supabase
      .from('admins')
      .select('*')
      .eq('id', userId)
      .single()

    if (admin) {
      data.admin = admin
      sources.push('admins')

      // Get condominiums
      const { data: condominiums } = await supabase
        .from('condominiums')
        .select('id, name, address, city, units_count, total_tenants')
        .eq('admin_id', userId)
        .limit(10)

      if (condominiums) {
        data.condominiums = condominiums
        sources.push('condominiums')

        // If specific condominium, get more details
        if (context?.condominiumId) {
          const condoId = context.condominiumId

          // Get tenants and payment status
          if (query.toLowerCase().includes('pagamento') || query.toLowerCase().includes('paga')) {
            const { data: tenants } = await supabase
              .from('tenants')
              .select('name, surname, payment_status, last_payment_date')
              .eq('condominium_id', condoId)
            data.tenants = tenants
            sources.push('tenants')
          }

          // Get documents
          if (query.toLowerCase().includes('documento') || query.toLowerCase().includes('verbale')) {
            const { data: documents } = await supabase
              .from('documents')
              .select('name, category, created_at, ai_summary')
              .eq('condominium_id', condoId)
              .order('created_at', { ascending: false })
              .limit(10)
            data.documents = documents
            sources.push('documents')
          }

          // Get maintenance tasks
          if (query.toLowerCase().includes('manutenzione') || query.toLowerCase().includes('intervento')) {
            const { data: interventi } = await supabase
              .from('interventi')
              .select('title, status, priority, created_at')
              .eq('condominium_id', condoId)
              .order('created_at', { ascending: false })
              .limit(10)
            data.interventi = interventi
            sources.push('interventi')
          }
        }
      }
    }
  } catch (error) {
    console.error('Error gathering context:', error)
  }

  return { data, sources }
}

/**
 * Generate AI summary for uploaded document
 * Called after document upload
 */
export async function generateDocumentSummary(
  documentId: string,
  fileUrl: string,
  fileType: string
): Promise<{ summary: string; error?: string }> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return {
        summary: '',
        error: 'OPENAI_API_KEY not configured',
      }
    }

    // Extract text based on file type
    let text = ''

    if (fileType === 'application/pdf') {
      // Try to extract text from PDF
      try {
        // Download PDF from Supabase storage
        // fileUrl should be the storage path, not the public URL
        const storagePath = fileUrl.includes('condominiums/') ? fileUrl : fileUrl.split('/').pop() || fileUrl
        
        const { data, error: downloadError } = await supabase.storage
          .from('documents')
          .download(storagePath)

        if (downloadError) {
          return { 
            summary: '', 
            error: `Unable to download PDF: ${downloadError.message}. PDF text extraction requires pdf-parse package.` 
          }
        }

        // For now, return a placeholder since pdf-parse needs to be properly integrated
        // In production, you would use: const pdfParse = require('pdf-parse'); const pdfData = await pdfParse(data);
        return {
          summary: '',
          error: 'PDF text extraction requires pdf-parse package installation and integration. Install with: npm install pdf-parse',
        }
      } catch (error: any) {
        return { summary: '', error: `PDF processing error: ${error.message}` }
      }
    } else if (fileType.includes('text/') || fileType === 'text/plain') {
      // For text files, download and read
      const storagePath = fileUrl.includes('condominiums/') ? fileUrl : fileUrl.split('/').pop() || fileUrl
      const { data, error } = await supabase.storage.from('documents').download(storagePath)
      if (error) {
        return { summary: '', error: error.message }
      }
      text = await data.text()
    } else {
      return { summary: '', error: `File type ${fileType} not supported for summarization. Currently only PDF and text files are supported.` }
    }

    if (!text || text.length < 50) {
      return { summary: '', error: 'Document text too short or empty' }
    }

    // Generate summary
    const result = await summarizeDocument(text, { maxLength: 300, language: 'italiano' })

    if (result.error) {
      return result
    }

    // Save summary to database
    const { error: updateError } = await supabase
      .from('documents')
      .update({ ai_summary: result.summary })
      .eq('id', documentId)

    if (updateError) {
      console.error('Failed to save AI summary:', updateError)
      // Still return summary even if save failed
    }

    return result
  } catch (error: any) {
    return { summary: '', error: error.message }
  }
}
