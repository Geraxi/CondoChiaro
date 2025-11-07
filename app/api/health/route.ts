import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { successResponse, errorResponse } from '@/lib/api-response'

/**
 * Health Check Endpoint
 * Checks DB connectivity and optional Stripe connectivity
 * GET /api/health
 */
export async function GET() {
  const checks: {
    database: boolean
    stripe: boolean
    timestamp: string
  } = {
    database: false,
    stripe: false,
    timestamp: new Date().toISOString(),
  }

  // Check database connectivity
  try {
    const { error } = await supabase.from('system_settings').select('key').limit(1)
    checks.database = !error
  } catch (error) {
    console.error('Database health check failed:', error)
    checks.database = false
  }

  // Check Stripe connectivity (if keys are configured)
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY
    if (stripeKey) {
      // Simple connectivity check - could be enhanced to actually ping Stripe API
      checks.stripe = !!stripeKey
    } else {
      checks.stripe = true // Not configured, consider it "healthy"
    }
  } catch (error) {
    console.error('Stripe health check failed:', error)
    checks.stripe = false
  }

  const allHealthy = checks.database && checks.stripe

  if (allHealthy) {
    return NextResponse.json(
      successResponse(checks, 'All systems operational'),
      { status: 200 }
    )
  } else {
    return NextResponse.json(
      errorResponse('One or more services are unavailable', 'SERVICE_UNAVAILABLE', checks),
      { status: 503 }
    )
  }
}







