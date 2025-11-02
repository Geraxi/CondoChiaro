import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { successResponse, errorResponse } from '@/lib/api-response'
import { z } from 'zod'

// Validation schema
const tenantSchema = z.object({
  condominium_id: z.string().uuid(),
  apartment_id: z.string().uuid().optional(),
  name: z.string().min(1, 'Name is required'),
  surname: z.string().min(1, 'Surname is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
})

/**
 * Get all tenants for the authenticated admin
 * GET /api/tenants?condominium_id=xxx
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const condominiumId = searchParams.get('condominium_id')

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

    let query = supabase
      .from('tenants')
      .select(`
        *,
        apartments:apartments(id, unit_number, floor),
        condominiums:condominiums(id, name)
      `)
      .eq('condominiums.admin_id', user.id)

    // Filter by condominium if specified
    if (condominiumId) {
      query = query.eq('condominium_id', condominiumId)
    }

    const { data: tenants, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching tenants:', error)
      return NextResponse.json(
        errorResponse('Failed to fetch tenants', 'DATABASE_ERROR', error),
        { status: 500 }
      )
    }

    return NextResponse.json(
      successResponse(tenants, 'Tenants retrieved successfully'),
      { status: 200 }
    )

  } catch (error) {
    console.error('Unexpected error in GET /api/tenants:', error)
    return NextResponse.json(
      errorResponse('Internal server error', 'INTERNAL_ERROR', error),
      { status: 500 }
    )
  }
}

/**
 * Create a new tenant
 * POST /api/tenants
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate input
    const validation = tenantSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        errorResponse('Invalid input data', 'VALIDATION_ERROR', validation.error.errors),
        { status: 400 }
      )
    }

    const { condominium_id, apartment_id, name, surname, email, phone } = validation.data

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

    // Verify that the condominium belongs to this admin
    const { data: condominium, error: condoError } = await supabase
      .from('condominiums')
      .select('id')
      .eq('id', condominium_id)
      .eq('admin_id', user.id)
      .single()

    if (condoError || !condominium) {
      return NextResponse.json(
        errorResponse('Condominium not found or access denied', 'NOT_FOUND'),
        { status: 404 }
      )
    }

    // If apartment_id is provided, verify it belongs to the condominium
    if (apartment_id) {
      const { data: apartment, error: apartmentError } = await supabase
        .from('apartments')
        .select('id')
        .eq('id', apartment_id)
        .eq('condominium_id', condominium_id)
        .single()

      if (apartmentError || !apartment) {
        return NextResponse.json(
          errorResponse('Apartment not found or does not belong to this condominium', 'NOT_FOUND'),
          { status: 404 }
        )
      }
    }

    // Create tenant
    const { data: tenant, error } = await supabase
      .from('tenants')
      .insert({
        condominium_id,
        apartment_id: apartment_id || null,
        name: name.trim(),
        surname: surname.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        payment_status: 'pending',
      })
      .select(`
        *,
        apartments:apartments(id, unit_number, floor),
        condominiums:condominiums(id, name)
      `)
      .single()

    if (error) {
      console.error('Error creating tenant:', error)

      if (error.code === '23505') {
        return NextResponse.json(
          errorResponse('A tenant with this email already exists in this condominium', 'DUPLICATE_ERROR'),
          { status: 409 }
        )
      }

      return NextResponse.json(
        errorResponse('Failed to create tenant', 'DATABASE_ERROR', error),
        { status: 500 }
      )
    }

    return NextResponse.json(
      successResponse(tenant, 'Tenant created successfully'),
      { status: 201 }
    )

  } catch (error) {
    console.error('Unexpected error in POST /api/tenants:', error)
    return NextResponse.json(
      errorResponse('Internal server error', 'INTERNAL_ERROR', error),
      { status: 500 }
    )
  }
}