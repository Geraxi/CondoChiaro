import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe, processWebhookIdempotent, isStripeConfigured } from '@/lib/stripe'
import { errorResponse, successResponse } from '@/lib/api-response'
import { supabaseAdmin, hasServiceRole } from '@/lib/supabase-admin'
import {
  recalculateAdminSubscription,
  updatePlatformPaymentStatus,
  updateSupplierPlan,
} from '@/lib/billing'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      errorResponse('Missing stripe-signature header', 'MISSING_SIGNATURE'),
      { status: 400 }
    )
  }

  if (!isStripeConfigured || !stripe) {
    console.error('Stripe not configured; ignoring webhook')
    return NextResponse.json(errorResponse('Stripe not configured', 'SERVICE_UNAVAILABLE'), {
      status: 503,
    })
  }

  if (!hasServiceRole || !supabaseAdmin) {
    console.error('Supabase service role not configured for webhook handling')
    return NextResponse.json(
      errorResponse('Supabase admin client not configured', 'CONFIG_ERROR'),
      { status: 500 }
    )
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json(
      errorResponse('Webhook secret not configured', 'CONFIG_ERROR'),
      { status: 500 }
    )
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message)
    return NextResponse.json(
      errorResponse('Invalid signature', 'INVALID_SIGNATURE'),
      { status: 400 }
    )
  }

  const result = await processWebhookIdempotent(event.id, async () => {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(event.data.object as Stripe.Subscription)
        break

      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'payment_intent.succeeded':
        await handlePaymentIntentStatus(event.data.object as Stripe.PaymentIntent, 'succeeded')
        break

      case 'payment_intent.payment_failed':
        await handlePaymentIntentStatus(event.data.object as Stripe.PaymentIntent, 'failed')
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

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const adminId =
    (subscription.metadata?.admin_id as string | undefined) ||
    (await getAdminIdBySubscription(subscription.id))

  if (!adminId) {
    console.warn('Subscription update received without admin_id metadata', subscription.id)
    return
  }

  if (!supabaseAdmin) return
  const client = supabaseAdmin

  const stripeCustomerId =
    typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id

  await client
    .from('admins')
    .update({
      subscription_id: subscription.id,
      subscription_status: subscription.status,
      stripe_customer_id: stripeCustomerId ?? undefined,
    })
    .eq('id', adminId)

  await recalculateAdminSubscription(adminId, {
    stripeSubscriptionId: subscription.id,
    stripeCustomerId: stripeCustomerId ?? undefined,
    status: subscription.status,
  })

  const currentPeriodEnd = (subscription as Stripe.Subscription & { current_period_end?: number })
    .current_period_end

  if (currentPeriodEnd) {
    await client
      .from('subscriptions')
      .update({
        current_period_end: new Date(currentPeriodEnd * 1000).toISOString(),
      })
      .eq('admin_id', adminId)
  }
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const adminId =
    (subscription.metadata?.admin_id as string | undefined) ||
    (await getAdminIdBySubscription(subscription.id))

  if (!adminId) {
    console.warn('Subscription cancellation without admin_id metadata', subscription.id)
    return
  }

  if (!supabaseAdmin) return
  const client = supabaseAdmin

  await client
    .from('admins')
    .update({
      subscription_status: 'canceled',
    })
    .eq('id', adminId)

  await client
    .from('subscriptions')
    .update({
      status: 'canceled',
    })
    .eq('admin_id', adminId)
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const context = session.metadata?.context

  if (context === 'admin_subscription') {
    if (!session.subscription || !session.customer) {
      return
    }
    const subscription = await stripe!.subscriptions.retrieve(session.subscription as string)
    await handleSubscriptionUpdate(subscription)
  } else if (context === 'supplier_plan') {
    const supplierId = session.metadata?.supplier_id
    if (!supplierId || !session.subscription) {
      return
    }

    const subscription = await stripe!.subscriptions.retrieve(session.subscription as string)
    const currentPeriodEnd = (subscription as Stripe.Subscription & {
      current_period_end?: number
    }).current_period_end
    const renewalDate = currentPeriodEnd
      ? new Date(currentPeriodEnd * 1000).toISOString()
      : undefined
    const customerId =
      typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer?.id

    await updateSupplierPlan(
      supplierId,
      'pro',
      {
        status: 'active',
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: customerId,
        renewalDate,
      },
      {}
    )
  }
}

async function handlePaymentIntentStatus(
  intent: Stripe.PaymentIntent,
  status: 'succeeded' | 'failed'
) {
  if (!intent.id) {
    return
  }
  await updatePlatformPaymentStatus(intent.id, status)
}

async function getAdminIdBySubscription(subscriptionId: string): Promise<string | null> {
  if (!supabaseAdmin) return null

  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .select('admin_id')
    .eq('stripe_subscription_id', subscriptionId)
    .maybeSingle()

  if (error) {
    console.error('Error resolving admin by subscription:', error)
    return null
  }

  return data?.admin_id ?? null
}
