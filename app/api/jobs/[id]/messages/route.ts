import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabaseServer'
import { apiErrorResponse, apiSuccessResponse } from '@/lib/api-helpers'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const createMessageSchema = z.object({
  body: z.string().min(1),
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

// GET - Get messages for a job
export async function GET(
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

    // Verify user has access to this job (admin or supplier)
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*, suppliers!inner(*)')
      .eq('id', params.id)
      .single()

    if (jobError || !job) {
      return apiErrorResponse('Job not found', 'NOT_FOUND', 404)
    }

    // Check if user is admin or supplier for this job
    const isAdmin = job.admin_id === user.id
    const { data: supplierUser } = await supabase
      .from('supplier_users')
      .select('supplier_id')
      .eq('supplier_id', job.supplier_id)
      .eq('user_id', user.id)
      .single()

    if (!isAdmin && !supplierUser) {
      return apiErrorResponse('Access denied', 'AUTH_ERROR', 403)
    }

    // Get messages
    const { data: messages, error: messagesError } = await supabase
      .from('job_messages')
      .select('*')
      .eq('job_id', params.id)
      .order('created_at', { ascending: true })

    if (messagesError) {
      console.error('Get messages error:', messagesError)
      return apiErrorResponse('Failed to fetch messages', 'DB_ERROR', 500)
    }

    return apiSuccessResponse(messages || [], 'Messages retrieved successfully')
  } catch (error: any) {
    console.error('Get messages error:', error)
    return apiErrorResponse(error.message || 'Failed to fetch messages', 'SERVER_ERROR', 500)
  }
}

// POST - Send a message
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

    // Verify user has access to this job
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*, suppliers!inner(*)')
      .eq('id', params.id)
      .single()

    if (jobError || !job) {
      return apiErrorResponse('Job not found', 'NOT_FOUND', 404)
    }

    // Check if user is admin or supplier for this job
    const isAdmin = job.admin_id === user.id
    const { data: supplierUser } = await supabase
      .from('supplier_users')
      .select('supplier_id')
      .eq('supplier_id', job.supplier_id)
      .eq('user_id', user.id)
      .single()

    if (!isAdmin && !supplierUser) {
      return apiErrorResponse('Access denied', 'AUTH_ERROR', 403)
    }

    const body = await request.json()
    const data = createMessageSchema.parse(body)

    // Create message
    const { data: message, error: messageError } = await supabase
      .from('job_messages')
      .insert({
        job_id: params.id,
        sender_user_id: user.id,
        body: data.body,
        attachments: data.attachments,
      })
      .select()
      .single()

    if (messageError) {
      console.error('Create message error:', messageError)
      return apiErrorResponse('Failed to send message', 'DB_ERROR', 500)
    }

    return apiSuccessResponse(message, 'Message sent successfully')
  } catch (error: any) {
    console.error('Send message error:', error)
    if (error instanceof z.ZodError) {
      return apiErrorResponse('Validation error', 'VALIDATION_ERROR', 400)
    }
    return apiErrorResponse(error.message || 'Failed to send message', 'SERVER_ERROR', 500)
  }
}

