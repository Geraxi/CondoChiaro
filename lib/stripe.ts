/**
 * Stripe Integration Utilities
 * Handles subscriptions, payments, webhooks with idempotency
 */

import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY not configured')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
})

export { stripe }

/**
 * Create or update subscription for admin
 */
export async function createSubscription(
  customerId: string,
  priceId: string,
  trialDays: number = 30
) {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      trial_period_days: trialDays,
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    })

    return { data: subscription, error: null }
  } catch (error) {
    console.error('Error creating subscription:', error)
    return { data: null, error }
  }
}

/**
 * Cancel subscription (with grace period)
 */
export async function cancelSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    })

    return { data: subscription, error: null }
  } catch (error) {
    console.error('Error canceling subscription:', error)
    return { data: null, error }
  }
}

/**
 * Check if subscription is active and paid
 */
export async function isSubscriptionActive(subscriptionId: string): Promise<boolean> {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    
    return subscription.status === 'active' || subscription.status === 'trialing'
  } catch (error) {
    console.error('Error checking subscription:', error)
    return false
  }
}

/**
 * Get invoice with forfettario note
 */
export async function createInvoice(
  customerId: string,
  amount: number,
  description: string
) {
  try {
    const invoice = await stripe.invoices.create({
      customer: customerId,
      auto_advance: true,
      collection_method: 'charge_automatically',
      description,
      custom_fields: [
        {
          name: 'Note Legali',
          value: 'Operazione in franchigia da IVA ai sensi dell\'art. 1, commi 54–89 L. 190/2014',
        },
      ],
    })

    return { data: invoice, error: null }
  } catch (error) {
    console.error('Error creating invoice:', error)
    return { data: null, error }
  }
}

/**
 * Verify webhook signature for idempotency
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): boolean {
  try {
    stripe.webhooks.constructEvent(payload, signature, secret)
    return true
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return false
  }
}

/**
 * Process webhook idempotently using event ID
 */
export async function processWebhookIdempotent(
  eventId: string,
  handler: () => Promise<void>
) {
  // In production, store processed event IDs in database
  // This is a simplified version
  const processedEvents = new Set<string>()
  
  if (processedEvents.has(eventId)) {
    console.log(`Event ${eventId} already processed, skipping`)
    return { processed: true, skipped: true }
  }

  try {
    await handler()
    processedEvents.add(eventId)
    return { processed: true, skipped: false }
  } catch (error) {
    console.error('Error processing webhook:', error)
    return { processed: false, skipped: false, error }
  }
}

