import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabaseServer'
import { errorResponse, successResponse } from '@/lib/api-response'
import { apiErrorResponse, apiSuccessResponse } from '@/lib/api-helpers'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const completeJobSchema = z.object({
  amount_final: z.number().positive().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // Verify supplier has access
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*, suppliers!inner(*)')
      .eq('id', params.id)
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

    if (!['accepted', 'in_progress'].includes(job.status)) {
      return apiErrorResponse('Job cannot be completed', 'INVALID_STATE', 400)
    }

    const body = await request.json()
    const data = completeJobSchema.parse(body)

    // Update job
    const { data: updatedJob, error: updateError } = await supabase
      .from('jobs')
      .update({
        status: 'completed',
        amount_final: data.amount_final || job.amount_final || job.amount_est,
      })
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) {
      console.error('Job complete error:', updateError)
      return apiErrorResponse('Failed to complete job', 'DB_ERROR', 500)
    }

    // Create invoice draft
    const finalAmount = data.amount_final || job.amount_final || job.amount_est || 0

    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        job_id: params.id,
        total: finalAmount,
        paid: false,
      })
      .select()
      .single()

    if (invoiceError) {
      console.error('Invoice creation error:', invoiceError)
      // Job is still completed, just invoice creation failed
    }

    return apiSuccessResponse(
      {
        job: updatedJob,
        invoice: invoice || null,
      },
      'Job completed successfully'
    )
  } catch (error: any) {
    console.error('Complete job error:', error)
    if (error instanceof z.ZodError) {
      return apiErrorResponse('Validation error', 'VALIDATION_ERROR', 400)
    }
    return apiErrorResponse(error.message || 'Failed to complete job', 'SERVER_ERROR', 500)
  }
}

