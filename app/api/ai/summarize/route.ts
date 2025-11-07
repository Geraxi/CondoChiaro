import { NextRequest, NextResponse } from 'next/server'
import { generateDocumentSummary } from '@/lib/ai'
import { supabase, Document as SupabaseDocument } from '@/lib/supabase'
import { errorResponse, successResponse } from '@/lib/api-response'

/**
 * Generate AI summary for a document
 * POST /api/ai/summarize
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(errorResponse('Unauthorized', 'UNAUTHORIZED'), { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(errorResponse('Invalid token', 'INVALID_TOKEN'), { status: 401 })
    }

    const body = await request.json()
    const { documentId } = body

    if (!documentId) {
      return NextResponse.json(errorResponse('documentId is required', 'MISSING_PARAMS'), { status: 400 })
    }

    // Verify document exists and user has access
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('id, file_url, file_type, condominium_id, name')
      .eq('id', documentId)
      .single<Pick<SupabaseDocument, 'id' | 'file_url' | 'file_type' | 'condominium_id' | 'name'>>()

    if (docError || !document) {
      console.error('Document lookup error:', docError)
      return NextResponse.json(errorResponse('Document not found', 'NOT_FOUND'), { status: 404 })
    }

    // Verify admin owns the condominium
    const { data: condominium, error: condoError } = await supabase
      .from('condominiums')
      .select('admin_id')
      .eq('id', document.condominium_id)
      .single<{ admin_id: string }>()

    if (condoError || !condominium || condominium.admin_id !== user.id) {
      console.error('Condominium access error:', condoError)
      return NextResponse.json(errorResponse('Unauthorized access', 'FORBIDDEN'), { status: 403 })
    }

    // Generate summary - extract storage path from file_url
    // file_url might be a full URL or just the storage path
    let storagePath = document.file_url
    if (storagePath.includes('supabase.co/storage')) {
      // Extract path from full URL: .../documents/condominiums/xxx/file.pdf
      const match = storagePath.match(/\/documents\/(.+)$/)
      if (match) storagePath = match[1]
    } else if (!storagePath.includes('condominiums/')) {
      // If it's not a full path, try to construct it
      storagePath = `condominiums/${document.condominium_id}/${storagePath.split('/').pop()}`
    }

    const result = await generateDocumentSummary(
      documentId,
      storagePath,
      document.file_type ?? 'application/pdf'
    )

    if (result.error) {
      return NextResponse.json(
        errorResponse(`Failed to generate summary: ${result.error}`, 'AI_ERROR'),
        { status: 500 }
      )
    }

    return NextResponse.json(
      successResponse({ summary: result.summary }, 'Summary generated successfully')
    )
  } catch (error: any) {
    console.error('Summarize API error:', error)
    return NextResponse.json(
      errorResponse('Internal server error', 'SERVER_ERROR', { message: error.message }),
      { status: 500 }
    )
  }
}
