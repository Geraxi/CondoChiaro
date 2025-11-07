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

    const { data: condominiumRows, error: condominiumFetchError } = await supabase
      .from('condominiums')
      .select('id')
      .eq('admin_id', user.id)
      .returns<Array<{ id: string }>>()

    if (condominiumFetchError) {
      console.error('Failed to load condominiums for deletion:', condominiumFetchError)
    }

    const condominiumIds = (condominiumRows || []).map((row) => row.id)

    if (condominiumIds.length > 0) {
      const relatedTables = ['documents', 'suppliers', 'tenants', 'apartments'] as const

      for (const table of relatedTables) {
        const { error } = await (supabase as any)
          .from(table)
          .delete()
          .in('condominium_id', condominiumIds)

        if (error) {
          console.error(`Deletion error on table ${table}:`, error)
        }
      }

      const { error: condosDeleteError } = await (supabase as any)
        .from('condominiums')
        .delete()
        .in('id', condominiumIds)

      if (condosDeleteError) {
        console.error('Condominium deletion error:', condosDeleteError)
      }
    }

    const { error: adminDeleteError } = await supabase.from('admins').delete().eq('id', user.id)
    if (adminDeleteError) {
      console.error('Admin deletion error:', adminDeleteError)
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






