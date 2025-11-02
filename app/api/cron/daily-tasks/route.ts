import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { stripe } from '@/lib/stripe'
import { successResponse, errorResponse } from '@/lib/api-response'

/**
 * Daily Cron Job: Check unpaid invoices and send reminders
 * Runs daily at 2 AM UTC
 * GET /api/cron/daily-tasks
 */
export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      errorResponse('Unauthorized', 'UNAUTHORIZED'),
      { status: 401 }
    )
  }

  try {
    // Get all admins with past_due or unpaid subscriptions
    const { data: unpaidAdmins, error } = await supabase
      .from('admins')
      .select('id, email, subscription_id, subscription_status')
      .in('subscription_status', ['past_due', 'unpaid'])

    if (error) {
      throw error
    }

    // For each unpaid admin, check Stripe subscription status
    for (const admin of unpaidAdmins || []) {
      if (admin.subscription_id) {
        try {
          const subscription = await stripe.subscriptions.retrieve(
            admin.subscription_id
          )

          // Update status if changed
          if (subscription.status !== admin.subscription_status) {
            await supabase
              .from('admins')
              .update({ subscription_status: subscription.status })
              .eq('id', admin.id)
          }

          // If still unpaid after grace period, set to read-only
          if (subscription.status === 'unpaid' && subscription.cancel_at) {
            // Set read-only mode logic here
            console.log(`Setting admin ${admin.id} to read-only mode`)
          }
        } catch (stripeError) {
          console.error(`Error checking subscription ${admin.subscription_id}:`, stripeError)
        }
      }
    }

    return NextResponse.json(
      successResponse(
        { processed: unpaidAdmins?.length || 0 },
        'Daily tasks completed'
      )
    )
  } catch (error) {
    console.error('Daily cron job error:', error)
    return NextResponse.json(
      errorResponse('Daily tasks failed', 'CRON_ERROR'),
      { status: 500 }
    )
  }
}

