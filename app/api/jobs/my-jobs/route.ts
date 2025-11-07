import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabaseServer'
import { apiErrorResponse, apiSuccessResponse } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
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

    // Get supplier_id for this user
    const { data: supplierUser, error: supplierUserError } = await supabase
      .from('supplier_users')
      .select('supplier_id')
      .eq('user_id', user.id)
      .single()

    if (supplierUserError || !supplierUser) {
      return apiErrorResponse('Supplier access required', 'AUTH_ERROR', 403)
    }

    // Get query params for filtering
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') // optional: pending, accepted, in_progress, completed, etc.

    // Build query
    let query = supabase
      .from('jobs')
      .select(`
        *,
        condominiums (
          id,
          name,
          address
        ),
        admins (
          id,
          name,
          email
        )
      `)
      .eq('supplier_id', supplierUser.supplier_id)
      .order('created_at', { ascending: false })

    // Filter by status if provided
    if (status) {
      query = query.eq('status', status)
    }

    const { data: jobs, error: jobsError } = await query

    if (jobsError) {
      console.error('Get jobs error:', jobsError)
      return apiErrorResponse('Failed to fetch jobs', 'DB_ERROR', 500)
    }

    return apiSuccessResponse(jobs || [], 'Jobs retrieved successfully')
  } catch (error: any) {
    console.error('Get my jobs error:', error)
    return apiErrorResponse(error.message || 'Failed to fetch jobs', 'SERVER_ERROR', 500)
  }
}

