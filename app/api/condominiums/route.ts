import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { successResponse, errorResponse } from '@/lib/api-response'

/**
 * Get all condominiums for the authenticated admin
 * GET /api/condominiums
 */
export async function GET(request: Request) {
  try {
    // Get the user from the session
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        errorResponse('Unauthorized', 'UNAUTHORIZED'),
        { status: 401 }
      )
    }

    // Check if user is admin
    const userRole = user.user_metadata?.role
    if (userRole !== 'admin') {
      return NextResponse.json(
        errorResponse('Forbidden: Admin access required', 'FORBIDDEN'),
        { status: 403 }
      )
    }

    // Get condominiums for this admin
    const { data: condominiums, error } = await supabase
      .from('condominiums')
      .select(`
        *,
        apartments:apartments(count),
        tenants:tenants(count)
      `)
      .eq('admin_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching condominiums:', error)
      return NextResponse.json(
        errorResponse('Failed to fetch condominiums', 'DATABASE_ERROR', error),
        { status: 500 }
      )
    }

    return NextResponse.json(
      successResponse(condominiums, 'Condominiums retrieved successfully'),
      { status: 200 }
    )

  } catch (error) {
    console.error('Unexpected error in GET /api/condominiums:', error)
    return NextResponse.json(
      errorResponse('Internal server error', 'INTERNAL_ERROR', error),
      { status: 500 }
    )
  }
}

/**
 * Create a new condominium
 * POST /api/condominiums
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, address, city, postal_code } = body

    // Validate required fields
    if (!name || !address) {
      return NextResponse.json(
        errorResponse('Name and address are required', 'VALIDATION_ERROR'),
        { status: 400 }
      )
    }

    // Get the user from the session
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        errorResponse('Unauthorized', 'UNAUTHORIZED'),
        { status: 401 }
      )
    }

    // Check if user is admin
    const userRole = user.user_metadata?.role
    if (userRole !== 'admin') {
      return NextResponse.json(
        errorResponse('Forbidden: Admin access required', 'FORBIDDEN'),
        { status: 403 }
      )
    }

    // Create condominium
    const { data: condominium, error } = await supabase
      .from('condominiums')
      .insert({
        admin_id: user.id,
        name: name.trim(),
        address: address.trim(),
        city: city?.trim() || null,
        postal_code: postal_code?.trim() || null,
        units_count: 0,
        total_tenants: 0,
        monthly_revenue: 0,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating condominium:', error)

      if (error.code === '23505') {
        return NextResponse.json(
          errorResponse('A condominium with this name already exists', 'DUPLICATE_ERROR'),
          { status: 409 }
        )
      }

      return NextResponse.json(
        errorResponse('Failed to create condominium', 'DATABASE_ERROR', error),
        { status: 500 }
      )
    }

    return NextResponse.json(
      successResponse(condominium, 'Condominium created successfully'),
      { status: 201 }
    )

  } catch (error) {
    console.error('Unexpected error in POST /api/condominiums:', error)
    return NextResponse.json(
      errorResponse('Internal server error', 'INTERNAL_ERROR', error),
      { status: 500 }
    )
  }
}