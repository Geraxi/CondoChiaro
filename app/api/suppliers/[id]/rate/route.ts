import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabaseServer'
import { apiErrorResponse, apiSuccessResponse } from '@/lib/api-helpers'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const rateSchema = z.object({
  job_id: z.string().uuid(),
  quality_rating: z.number().min(1).max(5),
  timeliness_rating: z.number().min(1).max(5),
  communication_rating: z.number().min(1).max(5),
  comments: z.string().optional(),
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

    // Verify user is admin
    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('id')
      .eq('id', user.id)
      .single()

    if (adminError || !admin) {
      return apiErrorResponse('Admin access required', 'AUTH_ERROR', 403)
    }

    const body = await request.json()
    const data = rateSchema.parse(body)

    // Verify job exists and belongs to this admin and supplier
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*, suppliers(id)')
      .eq('id', data.job_id)
      .eq('admin_id', user.id)
      .eq('supplier_id', params.id)
      .eq('status', 'completed')
      .single()

    if (jobError || !job) {
      return apiErrorResponse('Job not found or not completed', 'NOT_FOUND', 404)
    }

    // Check if rating already exists
    const { data: existingRating } = await supabase
      .from('supplier_ratings')
      .select('id')
      .eq('job_id', data.job_id)
      .single()

    if (existingRating) {
      // Update existing rating
      const { data: rating, error: ratingError } = await supabase
        .from('supplier_ratings')
        .update({
          quality_rating: data.quality_rating,
          timeliness_rating: data.timeliness_rating,
          communication_rating: data.communication_rating,
          comments: data.comments || null,
        })
        .eq('id', existingRating.id)
        .select()
        .single()

      if (ratingError) {
        console.error('Error updating rating:', ratingError)
        return apiErrorResponse('Failed to update rating', 'DB_ERROR', 500)
      }

      return apiSuccessResponse(rating, 'Valutazione aggiornata con successo')
    }

    // Create new rating
    const { data: rating, error: ratingError } = await supabase
      .from('supplier_ratings')
      .insert({
        supplier_id: params.id,
        job_id: data.job_id,
        admin_id: user.id,
        quality_rating: data.quality_rating,
        timeliness_rating: data.timeliness_rating,
        communication_rating: data.communication_rating,
        comments: data.comments || null,
      })
      .select()
      .single()

    if (ratingError) {
      console.error('Error creating rating:', ratingError)
      return apiErrorResponse('Failed to create rating', 'DB_ERROR', 500)
    }

    // Create notification for supplier (if notifications table exists)
    try {
      const { data: supplierUsers } = await supabase
        .from('supplier_users')
        .select('user_id')
        .eq('supplier_id', params.id)
        .limit(1)

      if (supplierUsers && supplierUsers.length > 0) {
        await supabase.from('notifications').insert({
          user_id: supplierUsers[0].user_id,
          type: 'supplier_rating_received',
          title: 'Nuova Valutazione Ricevuta',
          message: `Hai ricevuto una nuova valutazione`,
          link: `/supplier/dashboard`,
          metadata: {
            average_rating: rating.average_rating,
            supplier_id: params.id,
          },
        })
      }
    } catch (notifError) {
      // Notifications table might not exist, continue anyway
      console.log('Could not create notification:', notifError)
    }

    return apiSuccessResponse(rating, 'Valutazione creata con successo')
  } catch (error: any) {
    console.error('Rate supplier error:', error)
    if (error instanceof z.ZodError) {
      return apiErrorResponse('Validation error', 'VALIDATION_ERROR', 400)
    }
    return apiErrorResponse(error.message || 'Failed to rate supplier', 'SERVER_ERROR', 500)
  }
}

