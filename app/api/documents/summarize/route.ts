import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { successResponse, errorResponse } from '@/lib/api-response'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Generate AI summary for a document
 * POST /api/documents/summarize
 */
export async function POST(request: Request) {
  try {
    // Check if AI features are enabled
    if (process.env.NEXT_PUBLIC_AI_FEATURES_ENABLED !== 'true') {
      return NextResponse.json(
        errorResponse('AI features are not enabled', 'FEATURE_DISABLED'),
        { status: 503 }
      )
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        errorResponse('OpenAI API key not configured', 'SERVICE_UNAVAILABLE'),
        { status: 503 }
      )
    }

    const body = await request.json()
    const { documentId, fileUrl } = body

    if (!documentId || !fileUrl) {
      return NextResponse.json(
        errorResponse('documentId and fileUrl are required', 'VALIDATION_ERROR'),
        { status: 400 }
      )
    }

    // Get the user from the session
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        errorResponse('Unauthorized', 'UNAUTHORIZED'),
        { status: 401 }
      )
    }

    // Check if user is admin
    const userRole = user.user_metadata?.role
    if (userRole !== 'admin') {
      return NextResponse.json(
        errorResponse('Forbidden: Admin access required', 'FORBIDDEN'),
        { status: 403 }
      )
    }

    // Get document details and verify ownership
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select(`
        *,
        condominiums:condominiums(admin_id)
      `)
      .eq('id', documentId)
      .single()

    if (docError || !document) {
      return NextResponse.json(
        errorResponse('Document not found', 'NOT_FOUND'),
        { status: 404 }
      )
    }

    // Verify admin owns the condominium
    if (document.condominiums.admin_id !== user.id) {
      return NextResponse.json(
        errorResponse('Access denied', 'FORBIDDEN'),
        { status: 403 }
      )
    }

    // Check if document is a PDF
    if (!document.file_type.includes('pdf')) {
      return NextResponse.json(
        errorResponse('Only PDF documents can be summarized', 'UNSUPPORTED_FORMAT'),
        { status: 400 }
      )
    }

    // Download PDF content
    let pdfText = ''
    try {
      const response = await fetch(fileUrl)
      if (!response.ok) {
        throw new Error(`Failed to download PDF: ${response.statusText}`)
      }

      const pdfBuffer = await response.arrayBuffer()

      // Extract text from PDF (simplified approach)
      // In production, you'd use a proper PDF parsing library
      const { default: pdfjs } = await import('pdfjs-dist')
      const pdf = await pdfjs.getDocument({ data: pdfBuffer }).promise
      const numPages = pdf.numPages

      const textPromises = []
      for (let i = 1; i <= Math.min(numPages, 50); i++) { // Limit to first 50 pages to save tokens
        textPromises.push(
          pdf.getPage(i).then(page =>
            page.getTextContent().then(content =>
              content.items.map(item => ('str' in item ? item.str : '')).join(' ')
            )
          )
        )
      }

      const pageTexts = await Promise.all(textPromises)
      pdfText = pageTexts.join('\n\n')

    } catch (pdfError) {
      console.error('Error processing PDF:', pdfError)
      return NextResponse.json(
        errorResponse('Failed to process PDF document', 'PDF_PROCESSING_ERROR', pdfError),
        { status: 500 }
      )
    }

    if (!pdfText.trim()) {
      return NextResponse.json(
        errorResponse('No text content found in PDF', 'NO_CONTENT'),
        { status: 400 }
      )
    }

    // Generate summary using OpenAI
    let summary = ''
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `Sei un assistente AI specializzato nella sintesi di documenti condominiali italiani.
            Analizza il testo fornito e crea un riassunto conciso in italiano che includa:
            1. Punti chiave del documento
            2. Decisioni importanti prese
            3. Importi o cifre menzionate
            4. Scadenze o date importanti
            5. Azioni richieste ai condòmini

            Il riassunto deve essere chiaro, professionale e di facile comprensione per amministratori di condominio.`
          },
          {
            role: 'user',
            content: `Ecco il testo del documento condominiale da analizzare e riassumere:\n\n${pdfText.substring(0, 15000)}` // Limit to 15k characters
          }
        ],
        max_tokens: 1000,
        temperature: 0.3,
      })

      summary = completion.choices[0]?.message?.content || 'Impossibile generare un riassunto'

    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError)
      return NextResponse.json(
        errorResponse('Failed to generate AI summary', 'AI_SERVICE_ERROR', openaiError),
        { status: 500 }
      )
    }

    // Save summary to database
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        ai_summary: summary,
        updated_at: new Date().toISOString(),
      })
      .eq('id', documentId)

    if (updateError) {
      console.error('Error saving summary:', updateError)
      // Don't fail the request if saving fails, but log it
    }

    return NextResponse.json(
      successResponse(
        {
          documentId,
          summary,
          processedAt: new Date().toISOString(),
        },
        'Document summary generated successfully'
      ),
      { status: 200 }
    )

  } catch (error) {
    console.error('Unexpected error in POST /api/documents/summarize:', error)
    return NextResponse.json(
      errorResponse('Internal server error', 'INTERNAL_ERROR', error),
      { status: 500 }
    )
  }
}