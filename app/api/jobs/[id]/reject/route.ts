import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabaseServer'
import { apiErrorResponse, apiSuccessResponse } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

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

    if (job.status !== 'pending') {
      return apiErrorResponse('Job cannot be rejected', 'INVALID_STATE', 400)
    }

    // Update job status to cancelled
    const { data: updatedJob, error: updateError } = await supabase
      .from('jobs')
      .update({ status: 'cancelled' })
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) {
      console.error('Job reject error:', updateError)
      return apiErrorResponse('Failed to reject job', 'DB_ERROR', 500)
    }

    return apiSuccessResponse(updatedJob, 'Job rejected successfully')
  } catch (error: any) {
    console.error('Reject job error:', error)
    return apiErrorResponse(error.message || 'Failed to reject job', 'SERVER_ERROR', 500)
  }
}

