import { NextRequest, NextResponse } from 'next/server'
import { processAIQuery } from '@/lib/ai'
import { supabase } from '@/lib/supabase'
import { errorResponse, successResponse } from '@/lib/api-response'

/**
 * AI Assistant Query Handler (Ask CondoChiaro)
 * POST /api/ai/assistant
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
    const { query, condominiumId, role } = body

    if (!query || typeof query !== 'string') {
      return NextResponse.json(errorResponse('Query is required', 'MISSING_PARAMS'), { status: 400 })
    }

    // Determine user role if not provided
    let userRole = role || 'admin'
    if (!role) {
      const { data: admin } = await supabase
        .from('admins')
        .select('id')
        .eq('id', user.id)
        .single()

      if (admin) {
        userRole = 'admin'
      } else {
        // Check if tenant or supplier (implement based on your auth structure)
        userRole = 'tenant' // placeholder
      }
    }

    // Verify condominium access if condominiumId provided
    if (condominiumId) {
      const { data: condominium } = await supabase
        .from('condominiums')
        .select('admin_id')
        .eq('id', condominiumId)
        .single<{ admin_id: string }>()

      if (!condominium) {
        return NextResponse.json(errorResponse('Condominium not found', 'NOT_FOUND'), { status: 404 })
      }

      if (userRole === 'admin' && condominium.admin_id !== user.id) {
        return NextResponse.json(errorResponse('Unauthorized access', 'FORBIDDEN'), { status: 403 })
      }
    }

    // Process AI query
    const result = await processAIQuery(query, user.id, {
      condominiumId,
      role: userRole as 'admin' | 'tenant' | 'supplier',
    })

    if (result.error) {
      return NextResponse.json(
        errorResponse(`AI query failed: ${result.error}`, 'AI_ERROR'),
        { status: 500 }
      )
    }

    return NextResponse.json(
      successResponse(
        {
          answer: result.answer,
          sources: result.sources || [],
        },
        'Query processed successfully'
      )
    )
  } catch (error: any) {
    console.error('AI Assistant API error:', error)
    return NextResponse.json(
      errorResponse('Internal server error', 'SERVER_ERROR', { message: error.message }),
      { status: 500 }
    )
  }
}




