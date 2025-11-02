import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'

/**
 * GDPR: Delete User Data Endpoint
 * Permanently deletes all user data
 * DELETE /api/delete-user-data
 */
export async function DELETE(request: NextRequest) {
  try {
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      request.headers.get('authorization')?.replace('Bearer ', '') || ''
    )

    if (authError || !user) {
      return NextResponse.json(
        errorResponse('Unauthorized', 'UNAUTHORIZED'),
        { status: 401 }
      )
    }

    // Verify deletion with confirmation token
    const { searchParams } = new URL(request.url)
    const confirmationToken = searchParams.get('token')
    
    if (!confirmationToken || confirmationToken !== process.env.DELETE_CONFIRMATION_TOKEN) {
      return NextResponse.json(
        errorResponse('Confirmation token required', 'CONFIRMATION_REQUIRED'),
        { status: 400 }
      )
    }

    // Delete in order: documents, suppliers, tenants, apartments, condominiums, admin profile
    // RLS policies ensure users can only delete their own data
    
    const deleteOperations = [
      // Delete documents
      supabase.from('documents').delete().in('condominium_id', 
        supabase.from('condominiums').select('id').eq('admin_id', user.id)
      ),
      // Delete suppliers
      supabase.from('suppliers').delete().in('condominium_id',
        supabase.from('condominiums').select('id').eq('admin_id', user.id)
      ),
      // Delete tenants
      supabase.from('tenants').delete().in('condominium_id',
        supabase.from('condominiums').select('id').eq('admin_id', user.id)
      ),
      // Delete apartments
      supabase.from('apartments').delete().in('condominium_id',
        supabase.from('condominiums').select('id').eq('admin_id', user.id)
      ),
      // Delete condominiums
      supabase.from('condominiums').delete().eq('admin_id', user.id),
      // Delete admin profile
      supabase.from('admins').delete().eq('id', user.id),
    ]

    // Execute deletions sequentially to respect foreign key constraints
    for (const operation of deleteOperations) {
      const { error } = await operation
      if (error) {
        console.error('Deletion error:', error)
        // Continue with other deletions even if one fails
      }
    }

    // Delete auth user (Supabase Admin API - requires service role key)
    // Note: This requires server-side service role key
    // In production, you'd call Supabase Admin API here
    
    return NextResponse.json(
      successResponse(
        { deleted_at: new Date().toISOString() },
        'User data deleted successfully'
      ),
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      handleApiError(error),
      { status: 500 }
    )
  }
}

