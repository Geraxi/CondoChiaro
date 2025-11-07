import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { stripe, isStripeConfigured } from '@/lib/stripe'
import { successResponse, errorResponse } from '@/lib/api-response'

/**
 * Daily Cron Job: Verify subscription renewals
 * Runs daily at 6 AM UTC
 * GET /api/cron/subscription-checks
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      errorResponse('Unauthorized', 'UNAUTHORIZED'),
      { status: 401 }
    )
  }

  try {
    if (!isStripeConfigured || !stripe) {
      console.warn('Stripe not configured; skipping subscription checks cron job')
      return NextResponse.json(
        successResponse(
          { checked: 0, updated: 0 },
          'Stripe not configured; subscription checks skipped'
        )
      )
    }

    // Get all active subscriptions
    const { data: admins, error } = await supabase
      .from('admins')
      .select('id, subscription_id, trial_ends_at, subscription_status')
      .in('subscription_status', ['active', 'trialing'])
      .returns<
        Array<{
          id: string
          subscription_id: string | null
          subscription_status: string
          trial_ends_at: string | null
        }>
      >()

    if (error) {
      throw error
    }

    let checked = 0
    let updated = 0

    for (const admin of admins || []) {
      checked++

      // Check if trial has expired
      if (admin.trial_ends_at && new Date(admin.trial_ends_at) < new Date()) {
        if (admin.subscription_status === 'trialing' && !admin.subscription_id) {
          // Trial ended without subscription - cancel access
          await (supabase as any)
            .from('admins')
            .update({
              subscription_status: 'canceled',
              updated_at: new Date().toISOString(),
            })
            .eq('id', admin.id)
          updated++
          continue
        }
      }

      // Verify subscription with Stripe
      if (admin.subscription_id) {
        try {
          const subscription = await stripe.subscriptions.retrieve(
            admin.subscription_id
          )

          // Update if status changed
          if (subscription.status !== admin.subscription_status) {
            await (supabase as any)
              .from('admins')
              .update({
                subscription_status: subscription.status,
                updated_at: new Date().toISOString(),
              })
              .eq('id', admin.id)
            updated++
          }
        } catch (stripeError) {
          console.error(`Error checking subscription for admin ${admin.id}:`, stripeError)
        }
      }
    }

    return NextResponse.json(
      successResponse(
        { checked, updated },
        'Subscription checks completed'
      )
    )
  } catch (error) {
    console.error('Subscription check cron error:', error)
    return NextResponse.json(
      errorResponse('Subscription checks failed', 'CRON_ERROR'),
      { status: 500 }
    )
  }
}





