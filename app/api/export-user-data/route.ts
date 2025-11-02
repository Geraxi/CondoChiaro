import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'

/**
 * GDPR: Export User Data Endpoint
 * Exports all user data in JSON format
 * GET /api/export-user-data
 */
export async function GET(request: NextRequest) {
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

    // Fetch all user data
    const [adminData, condosData, tenantsData, apartmentsData, suppliersData, documentsData] = await Promise.all([
      // Admin profile
      supabase.from('admins').select('*').eq('id', user.id).single(),
      // Condominiums
      supabase.from('condominiums').select('*').eq('admin_id', user.id),
      // Tenants (through condominiums)
      supabase
        .from('tenants')
        .select('*, condominiums!inner(admin_id)')
        .eq('condominiums.admin_id', user.id),
      // Apartments (through condominiums)
      supabase
        .from('apartments')
        .select('*, condominiums!inner(admin_id)')
        .eq('condominiums.admin_id', user.id),
      // Suppliers (through condominiums)
      supabase
        .from('suppliers')
        .select('*, condominiums!inner(admin_id)')
        .eq('condominiums.admin_id', user.id),
      // Documents (through condominiums)
      supabase
        .from('documents')
        .select('*, condominiums!inner(admin_id)')
        .eq('condominiums.admin_id', user.id),
    ])

    const exportData = {
      user: {
        id: user.id,
        email: user.email,
        metadata: user.user_metadata,
      },
      admin_profile: adminData.data,
      condominiums: condosData.data || [],
      tenants: tenantsData.data || [],
      apartments: apartmentsData.data || [],
      suppliers: suppliersData.data || [],
      documents: documentsData.data || [],
      export_date: new Date().toISOString(),
    }

    return NextResponse.json(
      successResponse(exportData, 'User data exported successfully'),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="condochiaro-data-export-${user.id}-${Date.now()}.json"`,
        },
      }
    )
  } catch (error) {
    return NextResponse.json(
      handleApiError(error),
      { status: 500 }
    )
  }
}

