import { NextRequest, NextResponse } from 'next/server'
import { recalculateAdminSubscription } from '@/lib/billing'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { isStripeConfigured, updateSubscriptionCondominiumCount } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('id, stripe_subscription_id, stripe_customer_id, subscription_status')
      .eq('id', user.id)
      .single()

    if (adminError || !admin) {
      return NextResponse.json(
        { success: false, message: 'Admin profile not found' },
        { status: 404 }
      )
    }

    const result = await recalculateAdminSubscription(admin.id, {
      stripeCustomerId: admin.stripe_customer_id ?? undefined,
      stripeSubscriptionId: admin.stripe_subscription_id ?? undefined,
      status: admin.subscription_status ?? undefined,
    })

    if (
      isStripeConfigured &&
      admin.stripe_subscription_id &&
      typeof result.pricing.condoCount === 'number'
    ) {
      await updateSubscriptionCondominiumCount(admin.stripe_subscription_id, result.pricing.condoCount)
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription recalculated',
      data: {
        pricing: result.pricing,
        subscription: result.subscription,
      },
    })
  } catch (error: any) {
    console.error('Subscription recalculation failed:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Unable to recalculate subscription',
        error: error?.message,
      },
      { status: 500 }
    )
  }
}
