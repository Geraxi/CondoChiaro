import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { successResponse, errorResponse } from '@/lib/api-response'
import { stripe } from '@/lib/stripe'
import { z } from 'zod'

// Validation schema
const subscriptionSchema = z.object({
  condominiumCount: z.number().min(1, 'At least 1 condominium is required'),
  paymentMethodId: z.string().optional(),
})

// Pricing configuration
const PRICING = {
  base: 1999, // €19.99 in cents
  perCondominium: 600, // €6.00 in cents
  currency: 'eur',
}

/**
 * Create a Stripe subscription
 * POST /api/payments/create-subscription
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate input
    const validation = subscriptionSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        errorResponse('Invalid input data', 'VALIDATION_ERROR', validation.error.errors),
        { status: 400 }
      )
    }

    const { condominiumCount, paymentMethodId } = validation.data

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

    // Get admin details
    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('id', user.id)
      .single()

    if (adminError || !admin) {
      return NextResponse.json(
        errorResponse('Admin profile not found', 'NOT_FOUND'),
        { status: 404 }
      )
    }

    // Calculate monthly price
    const monthlyAmount = PRICING.base + (PRICING.perCondominium * condominiumCount)

    try {
      // Create or retrieve Stripe customer
      let customerId = admin.subscription_id

      if (!customerId) {
        // Create new customer
        const customer = await stripe.customers.create({
          email: user.email!,
          name: admin.full_name || user.email!,
          metadata: {
            userId: user.id,
            companyName: admin.company_name || '',
          },
          address: {
            country: 'IT',
          },
        })
        customerId = customer.id

        // Update admin record with customer ID
        await supabase
          .from('admins')
          .update({ subscription_id: customerId })
          .eq('id', user.id)
      }

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        mode: 'subscription',
        line_items: [
          {
            price_data: {
              currency: PRICING.currency,
              unit_amount: monthlyAmount,
              recurring: {
                interval: 'month',
              },
              product_data: {
                name: 'CondoChiaro - Piano Premium',
                description: `Gestione ${condominCount} condomin${condominCount > 1 ? 'i' : 'io'}`,
                images: [],
              },
            },
            quantity: 1,
          },
        ],
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/billing?canceled=true`,
        customer_update: {
          address: 'auto',
          name: 'auto',
        },
        tax_id_collection: {
          enabled: true,
        },
        automatic_tax: {
          enabled: true,
        },
        metadata: {
          userId: user.id,
          condominiumCount: condominiumCount.toString(),
          plan: 'premium',
        },
        locale: 'it',
        billing_address_collection: 'required',
      })

      return NextResponse.json(
        successResponse(
          {
            sessionId: session.id,
            url: session.url,
            amount: monthlyAmount,
            currency: PRICING.currency,
            condominiumCount,
          },
          'Checkout session created successfully'
        ),
        { status: 200 }
      )

    } catch (stripeError) {
      console.error('Stripe error:', stripeError)
      return NextResponse.json(
        errorResponse('Payment processing error', 'PAYMENT_ERROR', stripeError),
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Unexpected error in POST /api/payments/create-subscription:', error)
    return NextResponse.json(
      errorResponse('Internal server error', 'INTERNAL_ERROR', error),
      { status: 500 }
    )
  }
}

/**
 * Get subscription status
 * GET /api/payments/create-subscription
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

    // Get admin details with subscription info
    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('id', user.id)
      .single()

    if (adminError || !admin) {
      return NextResponse.json(
        errorResponse('Admin profile not found', 'NOT_FOUND'),
        { status: 404 }
      )
    }

    let subscriptionDetails = null

    if (admin.subscription_id) {
      try {
        // Get subscription from Stripe
        const subscriptions = await stripe.subscriptions.list({
          customer: admin.subscription_id,
          limit: 1,
          status: 'active',
        })

        if (subscriptions.data.length > 0) {
          const subscription = subscriptions.data[0]
          subscriptionDetails = {
            id: subscription.id,
            status: subscription.status,
            currentPeriodStart: subscription.current_period_start,
            currentPeriodEnd: subscription.current_period_end,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            amount: subscription.items.data[0].price.unit_amount,
            currency: subscription.items.data[0].price.currency,
            condominiumCount: subscription.metadata.condominiumCount || '1',
          }
        }
      } catch (stripeError) {
        console.error('Error fetching subscription:', stripeError)
        // Don't fail the request if Stripe call fails
      }
    }

    return NextResponse.json(
      successResponse(
        {
          subscriptionStatus: admin.subscription_status,
          trialEndsAt: admin.trial_ends_at,
          subscription: subscriptionDetails,
        },
        'Subscription status retrieved successfully'
      ),
      { status: 200 }
    )

  } catch (error) {
    console.error('Unexpected error in GET /api/payments/create-subscription:', error)
    return NextResponse.json(
      errorResponse('Internal server error', 'INTERNAL_ERROR', error),
      { status: 500 }
    )
  }
}