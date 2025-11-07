import type { SupabaseClient } from '@supabase/supabase-js'
import { calculatePlatformFees, calculateSubscriptionTotal } from './config'
import { hasServiceRole, supabaseAdmin } from './supabase-admin'

type Client = SupabaseClient<any, any, any>

const requireClient = (client?: Client) => {
  if (client) return client
  if (supabaseAdmin) return supabaseAdmin
  throw new Error('Supabase service role client not configured')
}

export async function recalculateAdminSubscription(
  adminId: string,
  options?: { client?: Client; stripeSubscriptionId?: string; stripeCustomerId?: string; status?: string }
) {
  const client = requireClient(options?.client)

  const { count: condoCount, error: condoError } = await client
    .from('condominiums')
    .select('id', { count: 'exact', head: true })
    .eq('admin_id', adminId)

  if (condoError) {
    throw condoError
  }

  const pricing = calculateSubscriptionTotal(condoCount ?? 0)

  const upsertPayload = {
    admin_id: adminId,
    stripe_subscription_id: options?.stripeSubscriptionId ?? undefined,
    stripe_customer_id: options?.stripeCustomerId ?? undefined,
    base_fee: pricing.base,
    per_unit_fee: pricing.perCondo,
    condo_count: pricing.condoCount,
    total_price: pricing.total,
    status: options?.status ?? undefined,
  }

  const { data: subscription, error: upsertError } = await client
    .from('subscriptions')
    .upsert(upsertPayload, { onConflict: 'admin_id' })
    .select()
    .single()

  if (upsertError) {
    throw upsertError
  }

  return { subscription, pricing }
}

export async function recordPlatformPayment(
  payload: {
    payerId: string | null
    payeeId: string
    payeeType: 'admin' | 'supplier'
    condoId: string | null
    amount: number
    currency?: string
    stripePaymentId?: string
    status?: 'pending' | 'processing' | 'succeeded' | 'failed'
    metadata?: Record<string, any>
  },
  options?: { client?: Client }
) {
  const client = requireClient(options?.client)
  const fees = calculatePlatformFees(payload.amount)

  const { data, error } = await client
    .from('payments')
    .insert({
      payer_id: payload.payerId,
      payee_id: payload.payeeId,
      payee_type: payload.payeeType,
      condo_id: payload.condoId,
      amount: payload.amount,
      currency: payload.currency ?? 'eur',
      platform_fee_percent: fees.platformFeePercent,
      platform_fee_amount: fees.platformFee,
      stripe_fee_percent: fees.stripeFeePercent,
      stripe_fee_amount: fees.stripeFee,
      net_amount: fees.net,
      stripe_payment_id: payload.stripePaymentId,
      status: payload.status ?? 'pending',
      metadata: payload.metadata ?? {},
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return { payment: data, fees }
}

export async function updatePlatformPaymentStatus(
  stripePaymentId: string,
  status: 'succeeded' | 'failed'
) {
  const client = requireClient()

  const { data, error } = await client
    .from('payments')
    .update({ status })
    .eq('stripe_payment_id', stripePaymentId)
    .select()

  if (error) {
    throw error
  }

  return data
}

export async function updateSupplierPlan(
  supplierId: string,
  plan: 'free' | 'pro' | 'business',
  payload: {
    status?: string
    stripeSubscriptionId?: string
    stripeCustomerId?: string
    renewalDate?: string
  },
  options?: { client?: Client }
) {
  const client = requireClient(options?.client)

  const { data, error } = await client
    .from('suppliers')
    .update({
      plan,
      plan_status: payload.status ?? 'active',
      stripe_subscription_id: payload.stripeSubscriptionId ?? undefined,
      stripe_customer_id: payload.stripeCustomerId ?? undefined,
      plan_renewal_at: payload.renewalDate ?? undefined,
    })
    .eq('id', supplierId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

export const canUseServiceRole = hasServiceRole
