import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabaseServer'
import { errorResponse, successResponse } from '@/lib/api-response'
import { apiErrorResponse, apiSuccessResponse } from '@/lib/api-helpers'
import { createJobPayment, createJobCheckout } from '@/lib/stripeConnect'
import { stripe } from '@/lib/stripe'
import { z } from 'zod'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const payInvoiceSchema = z.object({
  useCheckout: z.boolean().default(false),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
  payerCustomerId: z.string().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return apiErrorResponse('Unauthorized', 'AUTH_ERROR', 401)
    }

    const token = authHeader.replace('Bearer ', '')
    const supabase = createServerClient(token)

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return apiErrorResponse('Unauthorized', 'AUTH_ERROR', 401)
    }

    // Verify admin owns this job
    const { data: admin } = await supabase.from('admins').select('id').eq('id', user.id).single()

    if (!admin) {
      return apiErrorResponse('Admin access required', 'AUTH_ERROR', 403)
    }

    // Get job and invoice
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*, suppliers!inner(*)')
      .eq('id', params.jobId)
      .eq('admin_id', admin.id)
      .single()

    if (jobError || !job) {
      return apiErrorResponse('Job not found', 'NOT_FOUND', 404)
    }

    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('job_id', params.jobId)
      .eq('paid', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (invoiceError || !invoice) {
      return apiErrorResponse('Invoice not found', 'NOT_FOUND', 404)
    }

    // Check supplier has Connect account
    if (!job.suppliers.stripe_connect_account_id) {
      return apiErrorResponse('Supplier has not connected Stripe account', 'CONFIG_ERROR', 400)
    }

    // Check if Stripe is configured
    if (!stripe) {
      return apiErrorResponse('Stripe is not configured', 'CONFIG_ERROR', 503)
    }

    const body = await request.json()
    const data = payInvoiceSchema.parse(body)

    if (data.useCheckout) {
      // Create Checkout session
      if (!data.successUrl || !data.cancelUrl) {
        return apiErrorResponse('successUrl and cancelUrl required for checkout', 'VALIDATION_ERROR', 400)
      }

      const checkout = await createJobCheckout({
        jobId: params.jobId,
        amount: invoice.total,
        supplierAccountId: job.suppliers.stripe_connect_account_id,
        successUrl: data.successUrl,
        cancelUrl: data.cancelUrl,
        metadata: {
          invoice_id: invoice.id,
          admin_id: admin.id,
        },
      })

      return apiSuccessResponse(
        {
          checkoutUrl: checkout.url,
          sessionId: checkout.sessionId,
          platformFeeAmount: checkout.platformFeeAmount,
        },
        'Checkout session created'
      )
    } else {
      // Create PaymentIntent
      const payment = await createJobPayment({
        jobId: params.jobId,
        amount: invoice.total,
        supplierAccountId: job.suppliers.stripe_connect_account_id,
        payerCustomerId: data.payerCustomerId,
        metadata: {
          invoice_id: invoice.id,
          admin_id: admin.id,
        },
      })

      // Update invoice with payment intent ID
      await supabase
        .from('invoices')
        .update({ stripe_payment_intent_id: payment.paymentIntentId })
        .eq('id', invoice.id)

      return apiSuccessResponse(
        {
          clientSecret: payment.clientSecret,
          paymentIntentId: payment.paymentIntentId,
          platformFeeAmount: payment.platformFeeAmount,
        },
        'Payment intent created'
      )
    }
  } catch (error: any) {
    console.error('Pay invoice error:', error)
    if (error instanceof z.ZodError) {
      return apiErrorResponse('Validation error', 'VALIDATION_ERROR', 400)
    }
    return apiErrorResponse(error.message || 'Failed to create payment', 'SERVER_ERROR', 500)
  }
}

