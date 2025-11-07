import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabaseServer'
import { errorResponse, successResponse } from '@/lib/api-response'
import { apiErrorResponse, apiSuccessResponse } from '@/lib/api-helpers'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const searchParamsSchema = z.object({
  lat: z.string().transform((val) => parseFloat(val)),
  lng: z.string().transform((val) => parseFloat(val)),
  radius: z.string().optional().transform((val) => (val ? parseFloat(val) : 10)),
  category: z.string().optional(),
  verified: z.string().optional().transform((val) => val === 'true'),
  min_rating: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
  page: z.string().optional().transform((val) => (val ? parseInt(val) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val) : 12)),
})

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return apiErrorResponse('Unauthorized', 'AUTH_ERROR', 401)
    }

    const token = authHeader.replace('Bearer ', '')
    const supabase = createServerClient(token)

    // Verify user is admin
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return apiErrorResponse('Unauthorized', 'AUTH_ERROR', 401)
    }

    const { data: admin } = await supabase.from('admins').select('id').eq('id', user.id).single()

    if (!admin) {
      return apiErrorResponse('Admin access required', 'AUTH_ERROR', 403)
    }

    // Parse query params
    const searchParams = request.nextUrl.searchParams
    const params = searchParamsSchema.parse({
      lat: searchParams.get('lat'),
      lng: searchParams.get('lng'),
      radius: searchParams.get('radius'),
      category: searchParams.get('category'),
      verified: searchParams.get('verified'),
      min_rating: searchParams.get('min_rating'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    })

    // Build query with geospatial filter
    let query = supabase
      .from('suppliers')
      .select('*', { count: 'exact' })
      .order('rating', { ascending: false })
      .order('created_at', { ascending: false })

    // Geospatial filter using PostGIS
    // Note: This requires a PostGIS function. For now, we'll do a simpler query
    // and filter in memory if needed, or use a database function
    if (params.lat && params.lng) {
      // Use raw SQL for geospatial query if PostGIS is available
      // For now, we'll get all suppliers and filter by distance later
      // In production, you'd use: ST_DWithin(coords, ST_MakePoint(lng, lat)::geography, radius)
    }

    // Category filter
    if (params.category) {
      query = query.contains('categories', [params.category])
    }

    // Verified filter
    if (params.verified !== undefined) {
      query = query.eq('verified', params.verified)
    }

    // Rating filter
    if (params.min_rating !== undefined) {
      query = query.gte('rating', params.min_rating)
    }

    // Pagination
    const offset = (params.page - 1) * params.limit
    query = query.range(offset, offset + params.limit - 1)

    const { data: suppliers, error, count } = await query

    if (error) {
      console.error('Search error:', error)
      // If it's a PostGIS error, try without geospatial filter
      if (error.message?.includes('st_dwithin') || error.message?.includes('postgis')) {
        // Fallback: get all suppliers without geospatial filter
        const { data: allSuppliers, error: fallbackError } = await supabase
          .from('suppliers')
          .select('*', { count: 'exact' })
          .order('rating', { ascending: false })
          .limit(params.limit)
          .range(offset, offset + params.limit - 1)

        if (fallbackError) {
          return apiErrorResponse('Failed to search suppliers', 'DB_ERROR', 500)
        }

        return apiSuccessResponse(
          {
            suppliers: allSuppliers || [],
            pagination: {
              page: params.page,
              limit: params.limit,
              total: count || 0,
              total_pages: Math.ceil((count || 0) / params.limit),
            },
          },
          'Suppliers retrieved (geospatial filter disabled)'
        )
      }
      return apiErrorResponse('Failed to search suppliers', 'DB_ERROR', 500)
    }

    // Calculate distances (simplified - would use PostGIS function in production)
    const suppliersWithDistance = suppliers?.map((supplier: any) => {
      let distance = null
      // For now, we'll return null for distance
      // In production, you'd use: ST_Distance(coords, ST_MakePoint(lng, lat)::geography) / 1000

      return {
        ...supplier,
        distance_km: distance,
      }
    })

    return apiSuccessResponse(
      {
        suppliers: suppliersWithDistance || [],
        pagination: {
          page: params.page,
          limit: params.limit,
          total: count || 0,
          total_pages: Math.ceil((count || 0) / params.limit),
        },
      },
      'Suppliers retrieved'
    )
  } catch (error: any) {
    console.error('Search suppliers error:', error)
    if (error instanceof z.ZodError) {
      return apiErrorResponse('Invalid search parameters', 'VALIDATION_ERROR', 400)
    }
    return apiErrorResponse(error.message || 'Failed to search suppliers', 'SERVER_ERROR', 500)
  }
}

