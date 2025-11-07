import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createConnectPaymentIntent } from '@/lib/stripe'
import { recordPlatformPayment } from '@/lib/billing'
import { STRIPE_PLATFORM_FEE_PERCENT } from '@/lib/config'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { payerId, payeeId, payeeType, condoId, amount, currency } = body

    if (!payeeId || !payeeType || !amount) {
      return NextResponse.json(
        { success: false, message: 'Missing payee or amount' },
        { status: 400 }
      )
    }

    const numericAmount = Number(amount)
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid amount provided' },
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

    let destinationAccount: string | null = null
    let adminOwner: string | null = null

    if (payeeType === 'admin') {
      const { data: admin, error } = await supabase
        .from('admins')
        .select('id, stripe_connect_account_id')
        .eq('id', payeeId)
        .single()

      if (error || !admin) {
        return NextResponse.json(
          { success: false, message: 'Admin payee not found' },
          { status: 404 }
        )
      }
      destinationAccount = admin.stripe_connect_account_id ?? null
      adminOwner = admin.id
    } else if (payeeType === 'supplier') {
      const { data: supplier, error } = await supabase
        .from('suppliers')
        .select('id, condominium_id, stripe_connect_account_id, plan, plan_status')
        .eq('id', payeeId)
        .single()

      if (error || !supplier) {
        return NextResponse.json(
          { success: false, message: 'Supplier payee not found' },
          { status: 404 }
        )
      }

      const { data: condo, error: condoError } = await supabase
        .from('condominiums')
        .select('admin_id')
        .eq('id', supplier.condominium_id)
        .single()

      if (condoError || !condo) {
        return NextResponse.json(
          { success: false, message: 'Condominium not found for supplier' },
          { status: 404 }
        )
      }

      adminOwner = condo.admin_id
      destinationAccount = supplier.stripe_connect_account_id ?? null
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid payee type' },
        { status: 400 }
      )
    }

    if (!adminOwner) {
      return NextResponse.json(
        { success: false, message: 'Unable to resolve condominium owner' },
        { status: 400 }
      )
    }

    const intent = await createConnectPaymentIntent({
      amount: numericAmount,
      destinationAccountId: destinationAccount,
      currency,
      metadata: {
        payer_id: payerId ?? '',
        payee_id: payeeId,
        payee_type: payeeType,
        condo_id: condoId ?? '',
      },
    })

    const record = await recordPlatformPayment(
      {
        payerId: payerId ?? null,
        payeeId,
        payeeType,
        condoId: condoId ?? null,
        amount: numericAmount,
        currency: currency ?? 'eur',
        stripePaymentId: intent.intent.id,
        status: 'pending',
        metadata: {
          stripe_application_fee_percent: STRIPE_PLATFORM_FEE_PERCENT,
        },
      },
      {}
    )

    return NextResponse.json({
      success: true,
      message: 'Payment intent created',
      data: {
        clientSecret: intent.intent.client_secret,
        paymentId: record.payment.id,
        fees: intent.fees,
      },
    })
  } catch (error: any) {
    console.error('Create payment intent error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create payment intent',
        error: error?.message,
      },
      { status: 500 }
    )
  }
}
