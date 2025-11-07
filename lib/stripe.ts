/**
 * Stripe Integration Utilities
 * Handles subscriptions, Connect payments, supplier plans, and webhooks
 */

import Stripe from 'stripe'
import {
  BASE_SUBSCRIPTION_FEE,
  PER_CONDO_FEE,
  STRIPE_DEFAULT_CURRENCY,
  STRIPE_PLATFORM_FEE_PERCENT,
  STRIPE_SUPPLIER_PRO_PRICE,
  STRIPE_CONNECT_ENABLED,
  calculatePlatformFees,
  calculateSubscriptionTotal,
  eurosToCents,
} from './config'

const stripeSecret = process.env.STRIPE_SECRET_KEY

if (!stripeSecret) {
  console.warn('STRIPE_SECRET_KEY not configured')
}

export const isStripeConfigured = Boolean(stripeSecret)

export const stripe = stripeSecret
  ? new Stripe(stripeSecret, {
      apiVersion: '2025-10-29.clover',
      typescript: true,
    })
  : null

const BASE_PRICE_ID = process.env.STRIPE_BASE_PRICE_ID || null
const CONDOMINIUM_PRICE_ID = process.env.STRIPE_CONDOMINIUM_PRICE_ID || null
const SUPPLIER_PRO_PRICE_ID = process.env.STRIPE_SUPPLIER_PRO_PRICE_ID || null

type SubscriptionPricing = ReturnType<typeof calculateSubscriptionTotal>

const toMetadata = (value: Record<string, string | number | boolean | undefined>) =>
  Object.fromEntries(
    Object.entries(value).map(([key, val]) => [key, val === undefined ? '' : String(val)])
  )

const buildSubscriptionItems = (
  condoCount: number
): Stripe.SubscriptionCreateParams.Item[] => {
  const pricing = calculateSubscriptionTotal(condoCount)
  if (!BASE_PRICE_ID) {
    throw new Error('STRIPE_BASE_PRICE_ID must be configured for subscription billing')
  }

  const baseItem: Stripe.SubscriptionCreateParams.Item = {
    price: BASE_PRICE_ID,
    quantity: 1,
    metadata: { tier: 'base' },
  }

  const items: Stripe.SubscriptionCreateParams.Item[] = [baseItem]

  if (pricing.condoCount > 0) {
    if (!CONDOMINIUM_PRICE_ID) {
      throw new Error('STRIPE_CONDOMINIUM_PRICE_ID must be configured for per-unit billing')
    }

    const perItem: Stripe.SubscriptionCreateParams.Item = {
      price: CONDOMINIUM_PRICE_ID,
      quantity: pricing.condoCount,
      metadata: { tier: 'per_unit' },
    }

    items.push(perItem)
  }

  return items
}

const buildCheckoutLineItems = (
  condoCount: number
): Stripe.Checkout.SessionCreateParams.LineItem[] => {
  const pricing = calculateSubscriptionTotal(condoCount)
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
    BASE_PRICE_ID
      ? { quantity: 1, price: BASE_PRICE_ID }
      : {
          quantity: 1,
          price_data: {
            currency: STRIPE_DEFAULT_CURRENCY,
            product_data: {
              name: 'CondoChiaro Base',
            },
            recurring: { interval: 'month' },
            unit_amount: eurosToCents(pricing.base),
          },
        },
  ]

  if (pricing.condoCount > 0) {
    lineItems.push(
      CONDOMINIUM_PRICE_ID
        ? { quantity: pricing.condoCount, price: CONDOMINIUM_PRICE_ID }
        : {
            quantity: pricing.condoCount,
            price_data: {
              currency: STRIPE_DEFAULT_CURRENCY,
              product_data: {
                name: 'Unità condominiali aggiuntive',
              },
              recurring: { interval: 'month' },
              unit_amount: eurosToCents(pricing.perCondo),
            },
          }
    )
  }

  return lineItems
}

export function calculateSubscriptionAmount(condoCount: number): SubscriptionPricing {
  return calculateSubscriptionTotal(condoCount)
}

export async function ensureStripeCustomer(params: {
  email?: string
  name?: string
  metadata?: Stripe.MetadataParam
  customerId?: string | null
}) {
  if (!stripe) {
    throw new Error('Stripe not configured')
  }

  if (params.customerId) {
    return params.customerId
  }

  if (!params.email) {
    throw new Error('Customer email required to create Stripe customer')
  }

  const customer = await stripe.customers.create({
    email: params.email,
    name: params.name,
    metadata: params.metadata,
  })

  return customer.id
}

export async function createAdminSubscriptionCheckoutSession(options: {
  adminId: string
  condoCount: number
  successUrl: string
  cancelUrl: string
  stripeCustomerId?: string | null
  customerEmail?: string
  customerName?: string
}) {
  if (!stripe) {
    throw new Error('Stripe not configured')
  }

  const { adminId, condoCount, successUrl, cancelUrl, customerEmail, customerName } = options
  const pricing = calculateSubscriptionTotal(condoCount)

  const customerId = await ensureStripeCustomer({
    customerId: options.stripeCustomerId ?? null,
    email: customerEmail,
    name: customerName,
    metadata: { admin_id: adminId },
  })

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
    line_items: buildCheckoutLineItems(condoCount),
    subscription_data: {
      metadata: toMetadata({
        admin_id: adminId,
        condo_count: pricing.condoCount,
        base_fee: pricing.base,
        per_unit_fee: pricing.perCondo,
        total_price: pricing.total,
      }),
    },
    metadata: toMetadata({
      context: 'admin_subscription',
      admin_id: adminId,
    }),
  })

  return {
    sessionId: session.id,
    url: session.url,
    customerId,
    pricing,
  }
}

export async function createSupplierPlanCheckoutSession(options: {
  supplierId: string
  successUrl: string
  cancelUrl: string
  stripeCustomerId?: string | null
  email?: string
  name?: string
}) {
  if (!stripe) {
    throw new Error('Stripe not configured')
  }

  const customerId = await ensureStripeCustomer({
    customerId: options.stripeCustomerId ?? null,
    email: options.email,
    name: options.name,
    metadata: { supplier_id: options.supplierId },
  })

  const lineItem: Stripe.Checkout.SessionCreateParams.LineItem =
    SUPPLIER_PRO_PRICE_ID
      ? { price: SUPPLIER_PRO_PRICE_ID, quantity: 1 }
      : {
          quantity: 1,
          price_data: {
            currency: STRIPE_DEFAULT_CURRENCY,
            product_data: {
              name: 'CondoChiaro Supplier Pro',
            },
            recurring: { interval: 'month' },
            unit_amount: eurosToCents(STRIPE_SUPPLIER_PRO_PRICE),
          },
        }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    success_url: options.successUrl,
    cancel_url: options.cancelUrl,
    allow_promotion_codes: true,
    line_items: [lineItem],
    subscription_data: {
      metadata: toMetadata({
        supplier_id: options.supplierId,
        plan: 'pro',
        amount: STRIPE_SUPPLIER_PRO_PRICE,
      }),
    },
    metadata: {
      context: 'supplier_plan',
      supplier_id: options.supplierId,
    },
  })

  return {
    sessionId: session.id,
    url: session.url,
    customerId,
  }
}

export async function createConnectPaymentIntent(options: {
  amount: number
  payerCustomerId?: string
  destinationAccountId?: string | null
  description?: string
  metadata?: Stripe.MetadataParam
  statementDescriptor?: string
  currency?: string
}) {
  if (!stripe) {
    throw new Error('Stripe not configured')
  }

  const currency = options.currency ?? STRIPE_DEFAULT_CURRENCY
  const fees = calculatePlatformFees(options.amount)

  const applicationFeeAmount = eurosToCents(fees.platformFee)

  const intent = await stripe.paymentIntents.create({
    amount: eurosToCents(options.amount),
    currency,
    customer: options.payerCustomerId ?? undefined,
    description:
      options.description ?? 'Commissione di servizio 1% applicata alle transazioni elettroniche',
    metadata: {
      ...(options.metadata || {}),
      service_fee_notice: 'Commissione di servizio 1% applicata alle transazioni elettroniche',
    },
    application_fee_amount:
      STRIPE_CONNECT_ENABLED && options.destinationAccountId ? applicationFeeAmount : undefined,
    transfer_data:
      STRIPE_CONNECT_ENABLED && options.destinationAccountId
        ? {
            destination: options.destinationAccountId,
          }
        : undefined,
    automatic_payment_methods: { enabled: true },
    statement_descriptor: options.statementDescriptor?.slice(0, 22),
  })

  return {
    intent,
    fees,
  }
}

/**
 * Create subscription directly via API (used by automation)
 */
export async function createSubscription(
  customerId: string,
  condominiumCount: number = 0,
  trialDays: number = 14
) {
  if (!stripe) {
    return { data: null, error: new Error('Stripe not configured') }
  }

  try {
    const items = buildSubscriptionItems(condominiumCount)

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items,
      trial_period_days: trialDays,
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: toMetadata({
        condo_count: condominiumCount,
        base_fee: BASE_SUBSCRIPTION_FEE,
        per_unit_fee: PER_CONDO_FEE,
      }),
    })

    return { data: subscription, error: null }
  } catch (error) {
    console.error('Error creating subscription:', error)
    return { data: null, error }
  }
}

/**
 * Update subscription when condominium count changes
 */
export async function updateSubscriptionCondominiumCount(
  subscriptionId: string,
  newCondominiumCount: number
) {
  if (!stripe) {
    return { data: null, error: new Error('Stripe not configured') }
  }

  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['items.data'],
    })

    const pricing = calculateSubscriptionTotal(newCondominiumCount)

    const perUnitItem = subscription.items.data.find(
      (item) => item.metadata?.tier === 'per_unit'
    ) ?? subscription.items.data[1]

    const updates: Stripe.SubscriptionUpdateParams = {
      metadata: toMetadata({
        ...subscription.metadata,
        condo_count: pricing.condoCount,
        total_price: pricing.total,
      }),
    }

    if (perUnitItem) {
      updates.items = [
        {
          id: perUnitItem.id,
          quantity: pricing.condoCount,
        },
      ]
    }

    const updated = await stripe.subscriptions.update(subscriptionId, updates)

    return { data: updated, error: null }
  } catch (error) {
    console.error('Error updating subscription:', error)
    return { data: null, error }
  }
}

export async function cancelSubscription(subscriptionId: string) {
  if (!stripe) {
    return { data: null, error: new Error('Stripe not configured') }
  }

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

export async function isSubscriptionActive(subscriptionId: string): Promise<boolean> {
  if (!stripe) {
    return false
  }

  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    return subscription.status === 'active' || subscription.status === 'trialing'
  } catch (error) {
    console.error('Error checking subscription:', error)
    return false
  }
}

export async function createInvoice(
  customerId: string,
  amount: number,
  description: string
) {
  if (!stripe) {
    return { data: null, error: new Error('Stripe not configured') }
  }

  try {
    const invoice = await stripe.invoices.create({
      customer: customerId,
      auto_advance: true,
      collection_method: 'charge_automatically',
      description,
      custom_fields: [
        {
          name: 'Note Legali',
          value:
            "Operazione in franchigia da IVA ai sensi dell'art. 1, commi 54–89 L. 190/2014",
        },
      ],
    })

    return { data: invoice, error: null }
  } catch (error) {
    console.error('Error creating invoice:', error)
    return { data: null, error }
  }
}

export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): boolean {
  if (!stripe) {
    return false
  }

  try {
    stripe.webhooks.constructEvent(payload, signature, secret)
    return true
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return false
  }
}

const processedEvents = new Set<string>()

export async function processWebhookIdempotent(
  eventId: string,
  handler: () => Promise<void>
) {
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
