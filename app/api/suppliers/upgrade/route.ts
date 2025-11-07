import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabaseServer'
import { errorResponse, successResponse } from '@/lib/api-response'
import { apiErrorResponse, apiSuccessResponse } from '@/lib/api-helpers'
import { createSupplierSubscription } from '@/lib/stripeConnect'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const upgradeSchema = z.object({
  supplier_id: z.string().uuid(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
})

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const data = upgradeSchema.parse(body)

    // Verify supplier ownership
    const { data: supplierUser } = await supabase
      .from('supplier_users')
      .select('supplier_id')
      .eq('supplier_id', data.supplier_id)
      .eq('user_id', user.id)
      .eq('role', 'owner')
      .single()

    if (!supplierUser) {
      return apiErrorResponse('Access denied', 'AUTH_ERROR', 403)
    }

    // Get supplier
    const { data: supplier, error: supplierError } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', data.supplier_id)
      .single()

    if (supplierError || !supplier) {
      return apiErrorResponse('Supplier not found', 'NOT_FOUND', 404)
    }

    // Get or create Stripe customer
    let customerId = supplier.stripe_customer_id

    if (!customerId && supplier.email) {
      // Create customer (simplified - would use stripe.customers.create)
      // For now, require customer ID to be set
      return apiErrorResponse('Stripe customer required', 'CONFIG_ERROR', 400)
    }

    const SUPPLIER_PRO_PRICE_ID = process.env.STRIPE_SUPPLIER_PRO_PRICE_ID

    if (!SUPPLIER_PRO_PRICE_ID) {
      return apiErrorResponse('Supplier Pro price not configured', 'CONFIG_ERROR', 500)
    }

    // Create checkout session
    const session = await createSupplierSubscription({
      supplierId: data.supplier_id,
      customerId: customerId!,
      priceId: SUPPLIER_PRO_PRICE_ID,
      successUrl: data.successUrl,
      cancelUrl: data.cancelUrl,
    })

    return apiSuccessResponse(
      {
        sessionId: session.id,
        url: session.url,
      },
      'Upgrade session created'
    )
  } catch (error: any) {
    console.error('Supplier upgrade error:', error)
    if (error instanceof z.ZodError) {
      return apiErrorResponse('Validation error', 'VALIDATION_ERROR', 400)
    }
    return apiErrorResponse(error.message || 'Failed to create upgrade session', 'SERVER_ERROR', 500)
  }
}
