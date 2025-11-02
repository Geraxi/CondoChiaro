import { NextRequest, NextResponse } from 'next/server'
import { stripe, verifyWebhookSignature, processWebhookIdempotent } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'
import { errorResponse, successResponse } from '@/lib/api-response'

/**
 * Stripe Webhook Handler
 * Processes Stripe events idempotently
 * POST /api/webhooks/stripe
 */
export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      errorResponse('Missing stripe-signature header', 'MISSING_SIGNATURE'),
      { status: 400 }
    )
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json(
      errorResponse('Webhook secret not configured', 'CONFIG_ERROR'),
      { status: 500 }
    )
  }

  // Verify webhook signature
  let event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message)
    return NextResponse.json(
      errorResponse('Invalid signature', 'INVALID_SIGNATURE'),
      { status: 400 }
    )
  }

  // Process webhook idempotently
  const result = await processWebhookIdempotent(event.id, async () => {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as any)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(event.data.object as any)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as any)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as any)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  })

  if (result.skipped) {
    return NextResponse.json(
      successResponse({ eventId: event.id }, 'Event already processed'),
      { status: 200 }
    )
  }

  if (result.processed) {
    return NextResponse.json(
      successResponse({ eventId: event.id }, 'Webhook processed successfully'),
      { status: 200 }
    )
  }

  return NextResponse.json(
    errorResponse('Failed to process webhook', 'PROCESSING_ERROR', result.error),
    { status: 500 }
  )
}

async function handleSubscriptionUpdate(subscription: any) {
  const customerId = subscription.customer
  const status = subscription.status

  // Find admin by Stripe customer ID
  const { data: admin, error } = await supabase
    .from('admins')
    .select('id')
    .eq('subscription_id', subscription.id)
    .single()

  if (error || !admin) {
    console.error('Admin not found for subscription:', subscription.id)
    return
  }

  // Update subscription status
  await supabase
    .from('admins')
    .update({
      subscription_status: status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', admin.id)

  // If unpaid, set to read-only mode
  if (status === 'past_due' || status === 'unpaid') {
    // Implement read-only mode logic
    console.log(`Setting admin ${admin.id} to read-only mode`)
  }
}

async function handleSubscriptionCanceled(subscription: any) {
  const { error } = await supabase
    .from('admins')
    .update({
      subscription_status: 'canceled',
      updated_at: new Date().toISOString(),
    })
    .eq('subscription_id', subscription.id)

  if (error) {
    console.error('Error updating canceled subscription:', error)
  }
}

async function handlePaymentSucceeded(invoice: any) {
  const subscriptionId = invoice.subscription

  await supabase
    .from('admins')
    .update({
      subscription_status: 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('subscription_id', subscriptionId)
}

async function handlePaymentFailed(invoice: any) {
  const subscriptionId = invoice.subscription

  await supabase
    .from('admins')
    .update({
      subscription_status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('subscription_id', subscriptionId)

  // Set to read-only mode
  console.log(`Payment failed for subscription ${subscriptionId}, setting read-only mode`)
}

