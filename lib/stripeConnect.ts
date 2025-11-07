/**
 * Stripe Connect utilities for Supplier Marketplace
 * Handles connected accounts, payouts, and platform fees
 */

import Stripe from 'stripe'
import { stripe } from './stripe'

const PLATFORM_FEE_PERCENT = parseFloat(process.env.PLATFORM_FEE_PERCENT || '1.0')
const STRIPE_CONNECT_ENABLED = process.env.STRIPE_CONNECT_ENABLED === 'true'

// Don't throw on import - check in each function instead

/**
 * Create a Stripe Connect account for a supplier
 */
export async function createConnectAccount(supplierId: string, email: string) {
  if (!STRIPE_CONNECT_ENABLED || !stripe) {
    throw new Error('Stripe Connect is not enabled or Stripe is not configured')
  }

  const account = await stripe.accounts.create({
    type: 'standard',
    country: 'IT',
    email,
    capabilities: {
      transfers: { requested: true },
    },
    metadata: {
      supplier_id: supplierId,
    },
  })

  return account
}

/**
 * Create Connect account link for onboarding
 */
export async function createAccountLink(accountId: string, returnUrl: string, refreshUrl: string) {
  if (!stripe) {
    throw new Error('Stripe is not configured')
  }
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: 'account_onboarding',
  })

  return accountLink
}

/**
 * Check if Connect account is fully onboarded
 */
export async function isAccountOnboarded(accountId: string): Promise<boolean> {
  if (!stripe) {
    throw new Error('Stripe is not configured')
  }
  const account = await stripe.accounts.retrieve(accountId)

  return account.details_submitted && account.charges_enabled && account.payouts_enabled
}

/**
 * Create PaymentIntent with platform fee for job payment
 */
export async function createJobPayment({
  jobId,
  amount,
  supplierAccountId,
  payerCustomerId,
  metadata = {},
}: {
  jobId: string
  amount: number // in euros
  supplierAccountId: string
  payerCustomerId?: string
  metadata?: Record<string, string>
}) {
  if (!STRIPE_CONNECT_ENABLED || !stripe) {
    throw new Error('Stripe Connect is not enabled or Stripe is not configured')
  }

  const amountCents = Math.round(amount * 100)
  const platformFeeCents = Math.round(amountCents * (PLATFORM_FEE_PERCENT / 100))

  const paymentIntent = await stripe.paymentIntents.create(
    {
      amount: amountCents,
      currency: 'eur',
      customer: payerCustomerId,
      application_fee_amount: platformFeeCents,
      transfer_data: {
        destination: supplierAccountId,
      },
      metadata: {
        job_id: jobId,
        platform_fee_percent: PLATFORM_FEE_PERCENT.toString(),
        ...metadata,
      },
    },
    {
      idempotencyKey: `job-${jobId}-${Date.now()}`,
    }
  )

  return {
    paymentIntentId: paymentIntent.id,
    clientSecret: paymentIntent.client_secret,
    platformFeeAmount: platformFeeCents / 100,
  }
}

/**
 * Create Checkout Session for job payment
 */
export async function createJobCheckout({
  jobId,
  amount,
  supplierAccountId,
  successUrl,
  cancelUrl,
  metadata = {},
}: {
  jobId: string
  amount: number
  supplierAccountId: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
}) {
  if (!STRIPE_CONNECT_ENABLED || !stripe) {
    throw new Error('Stripe Connect is not enabled or Stripe is not configured')
  }

  const amountCents = Math.round(amount * 100)
  const platformFeeCents = Math.round(amountCents * (PLATFORM_FEE_PERCENT / 100))

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_intent_data: {
      application_fee_amount: platformFeeCents,
      transfer_data: {
        destination: supplierAccountId,
      },
    },
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Intervento #${jobId}`,
            description: `Pagamento intervento condominiale`,
          },
          unit_amount: amountCents,
        },
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      job_id: jobId,
      platform_fee_percent: PLATFORM_FEE_PERCENT.toString(),
      ...metadata,
    },
  })

  return {
    sessionId: session.id,
    url: session.url,
    platformFeeAmount: platformFeeCents / 100,
  }
}

/**
 * Create supplier Pro plan subscription
 */
export async function createSupplierSubscription({
  supplierId,
  customerId,
  priceId,
  successUrl,
  cancelUrl,
}: {
  supplierId: string
  customerId: string
  priceId: string
  successUrl: string
  cancelUrl: string
}) {
  if (!stripe) {
    throw new Error('Stripe is not configured')
  }
  const SUPPLIER_PRO_PRICE_ID = process.env.STRIPE_SUPPLIER_PRO_PRICE_ID || priceId

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [
      {
        price: SUPPLIER_PRO_PRICE_ID,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      supplier_id: supplierId,
      plan: 'pro',
    },
  })

  return session
}

/**
 * Get transfer details for a payment
 */
export async function getTransferDetails(paymentIntentId: string) {
  if (!stripe) {
    throw new Error('Stripe is not configured')
  }
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
    expand: ['charges.data.balance_transaction'],
  })

  // Type assertion for expanded charges
  const expandedPaymentIntent = paymentIntent as any
  const charges = expandedPaymentIntent.charges?.data || []
  if (charges.length === 0) {
    return null
  }

  const charge = charges[0]
  const transfer = charge.transfer

  return {
    transferId: typeof transfer === 'string' ? transfer : transfer?.id,
    amount: charge.amount,
    applicationFee: charge.application_fee_amount,
    status: charge.status,
  }
}

