import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabaseServer'
import { errorResponse, successResponse } from '@/lib/api-response'
import { apiErrorResponse, apiSuccessResponse } from '@/lib/api-helpers'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const createQuoteSchema = z.object({
  items: z.array(
    z.object({
      desc: z.string().min(1),
      qty: z.number().positive(),
      unit: z.string().default('pz'),
      price: z.number().positive(),
    })
  ),
  notes: z.string().optional(),
  valid_until: z.string().datetime().optional().nullable(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return apiErrorResponse('Unauthorized', 'AUTH_ERROR', 401)
    }

    const token = authHeader.replace('Bearer ', '')
    const supabase = createServerClient(token)

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return apiErrorResponse('Unauthorized', 'AUTH_ERROR', 401)
    }

    // Verify supplier has access to this job
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*, suppliers!inner(*)')
      .eq('id', params.jobId)
      .single()

    if (jobError || !job) {
      return apiErrorResponse('Job not found', 'NOT_FOUND', 404)
    }

    // Check if user is supplier for this job
    const { data: supplierUser } = await supabase
      .from('supplier_users')
      .select('supplier_id')
      .eq('supplier_id', job.supplier_id)
      .eq('user_id', user.id)
      .single()

    if (!supplierUser) {
      return apiErrorResponse('Access denied', 'AUTH_ERROR', 403)
    }

    const body = await request.json()
    const data = createQuoteSchema.parse(body)

    // Calculate total
    const total = data.items.reduce((sum, item) => sum + item.qty * item.price, 0)

    // Create quote
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .insert({
        job_id: params.jobId,
        items: data.items,
        total,
        currency: 'EUR',
        status: 'sent',
        notes: data.notes || null,
        valid_until: data.valid_until || null,
      })
      .select()
      .single()

    if (quoteError) {
      console.error('Quote creation error:', quoteError)
      return apiErrorResponse('Failed to create quote', 'DB_ERROR', 500)
    }

    return apiSuccessResponse(quote, 'Quote created successfully')
  } catch (error: any) {
    console.error('Create quote error:', error)
    if (error instanceof z.ZodError) {
      return apiErrorResponse('Validation error', 'VALIDATION_ERROR', 400)
    }
    return apiErrorResponse(error.message || 'Failed to create quote', 'SERVER_ERROR', 500)
  }
}

