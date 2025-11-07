import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createAdminSubscriptionCheckoutSession } from '@/lib/stripe'
import { recalculateAdminSubscription } from '@/lib/billing'

export async function POST(request: NextRequest) {
  try {
    const { successUrl, cancelUrl } = await request.json()

    if (!successUrl || !cancelUrl) {
      return NextResponse.json(
        { success: false, message: 'Missing successUrl or cancelUrl' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('id, email, full_name, stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (adminError || !admin) {
      return NextResponse.json(
        { success: false, message: 'Admin profile not found' },
        { status: 404 }
      )
    }

    const { pricing } = await recalculateAdminSubscription(admin.id)

    const session = await createAdminSubscriptionCheckoutSession({
      adminId: admin.id,
      condoCount: pricing.condoCount,
      successUrl,
      cancelUrl,
      stripeCustomerId: admin.stripe_customer_id ?? undefined,
      customerEmail: admin.email,
      customerName: admin.full_name ?? undefined,
    })

    return NextResponse.json({
      success: true,
      message: 'Checkout session created',
      data: {
        url: session.url,
        sessionId: session.sessionId,
        pricing,
      },
    })
  } catch (error: any) {
    console.error('Subscription checkout error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create checkout session',
        error: error?.message,
      },
      { status: 500 }
    )
  }
}
