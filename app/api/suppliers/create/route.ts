import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabaseServer'
import { errorResponse, successResponse } from '@/lib/api-response'
import { z } from 'zod'
import { createConnectAccount } from '@/lib/stripeConnect'

export const dynamic = 'force-dynamic'

function apiErrorResponse(message: string, code?: string, status: number = 500) {
  return NextResponse.json(errorResponse(message, code), { status })
}

function apiSuccessResponse<T>(data: T, message: string = 'Success') {
  return NextResponse.json(successResponse(data, message))
}

const createSupplierSchema = z.object({
  name: z.string().min(1),
  vat: z.string().optional(),
  pec: z.string().email().optional().or(z.literal('')),
  sdi: z.string().optional(),
  iban: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  categories: z.array(z.string()).default([]),
  coverage_km: z.number().int().min(1).max(100).default(10),
  org_id: z.string().uuid().optional(),
  // Autofill confirmed data
  autofillData: z
    .object({
      name: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      address: z.string().optional(),
      logo: z.string().url().optional(),
    })
    .optional(),
})

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return apiErrorResponse('Unauthorized', 'AUTH_ERROR', 401)
    }

    const token = authHeader.replace('Bearer ', '')
    const supabase = createServerClient(token)

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return apiErrorResponse('Unauthorized', 'AUTH_ERROR', 401)
    }

    const body = await request.json()
    const data = createSupplierSchema.parse(body)

    // Merge autofill data
    const supplierData: any = {
      name: data.autofillData?.name || data.name,
      phone: data.autofillData?.phone || data.phone,
      email: data.autofillData?.email || data.email,
      address: data.autofillData?.address || data.address,
      vat: data.vat,
      pec: data.pec || null,
      sdi: data.sdi || null,
      iban: data.iban || null,
      website: data.website || null,
      city: data.city || null,
      postal_code: data.postal_code || null,
      categories: data.categories,
      coverage_km: data.coverage_km,
      org_id: data.org_id || null,
      logo_url: data.autofillData?.logo || null,
    }

    // Add geolocation if provided
    if (data.latitude && data.longitude) {
      supplierData.coords = `POINT(${data.longitude} ${data.latitude})`
    }

    // Create supplier
    const { data: supplier, error: supplierError } = await supabase
      .from('suppliers')
      .insert(supplierData)
      .select()
      .single()

    if (supplierError) {
      console.error('Supplier creation error:', supplierError)
      return apiErrorResponse('Failed to create supplier', 'DB_ERROR', 500)
    }

    // Create supplier_user relationship (owner)
    const { error: userRelError } = await supabase.from('supplier_users').insert({
      supplier_id: supplier.id,
      user_id: user.id,
      role: 'owner',
    })

    if (userRelError) {
      console.error('Supplier user relation error:', userRelError)
      // Rollback supplier creation
      await supabase.from('suppliers').delete().eq('id', supplier.id)
      return apiErrorResponse('Failed to create supplier user relation', 'DB_ERROR', 500)
    }

    return apiSuccessResponse(supplier, 'Supplier created successfully')
  } catch (error: any) {
    console.error('Create supplier error:', error)
    if (error instanceof z.ZodError) {
      return apiErrorResponse('Validation error', 'VALIDATION_ERROR', 400)
    }
    return apiErrorResponse(error.message || 'Failed to create supplier', 'SERVER_ERROR', 500)
  }
}

