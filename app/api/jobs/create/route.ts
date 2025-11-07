import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabaseServer'
import { errorResponse, successResponse } from '@/lib/api-response'
import { apiErrorResponse, apiSuccessResponse } from '@/lib/api-helpers'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const createJobSchema = z.object({
  supplier_id: z.string().uuid(),
  condo_id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(['bassa', 'media', 'alta']).default('media'),
  scheduled_at: z.string().datetime().optional().nullable(),
  amount_est: z.number().positive().optional().nullable(),
  attachments: z
    .array(
      z.object({
        url: z.string().url(),
        filename: z.string(),
        type: z.string(),
      })
    )
    .default([]),
})

export async function POST(request: NextRequest) {
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

    // Verify admin and condo ownership
    const { data: admin } = await supabase.from('admins').select('id').eq('id', user.id).single()

    if (!admin) {
      return apiErrorResponse('Admin access required', 'AUTH_ERROR', 403)
    }

    const body = await request.json()
    const data = createJobSchema.parse(body)

    // Verify condo belongs to admin
    const { data: condo, error: condoError } = await supabase
      .from('condominiums')
      .select('id, admin_id')
      .eq('id', data.condo_id)
      .eq('admin_id', admin.id)
      .single()

    if (condoError || !condo) {
      return apiErrorResponse('Condominium not found or access denied', 'NOT_FOUND', 404)
    }

    // Verify supplier exists
    const { data: supplier, error: supplierError } = await supabase
      .from('suppliers')
      .select('id')
      .eq('id', data.supplier_id)
      .single()

    if (supplierError || !supplier) {
      return apiErrorResponse('Supplier not found', 'NOT_FOUND', 404)
    }

    // Create job
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .insert({
        admin_id: admin.id,
        supplier_id: data.supplier_id,
        condo_id: data.condo_id,
        title: data.title,
        description: data.description || null,
        priority: data.priority,
        scheduled_at: data.scheduled_at || null,
        amount_est: data.amount_est || null,
        attachments: data.attachments,
        status: 'pending',
      })
      .select()
      .single()

    if (jobError) {
      console.error('Job creation error:', jobError)
      return apiErrorResponse('Failed to create job', 'DB_ERROR', 500)
    }

    return apiSuccessResponse(job, 'Job created successfully')
  } catch (error: any) {
    console.error('Create job error:', error)
    if (error instanceof z.ZodError) {
      return apiErrorResponse('Validation error', 'VALIDATION_ERROR', 400)
    }
    return apiErrorResponse(error.message || 'Failed to create job', 'SERVER_ERROR', 500)
  }
}

