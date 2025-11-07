/**
 * Server-side Supabase client with service role
 * Use this for admin operations that bypass RLS
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Don't throw on module load - check at runtime instead

/**
 * Server-side client with service role (bypasses RLS)
 * Use with caution - only for admin operations
 */
export const supabaseServer = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null

/**
 * Get server client for a specific user
 * Uses RLS based on the user's auth token
 */
export function createServerClient(authToken?: string | null): SupabaseClient {
  if (!authToken || authToken.trim() === '') {
    throw new Error('Auth token is required')
  }
  
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !anonKey) {
    // Return a mock client that will fail gracefully instead of throwing
    // This prevents build-time errors when env vars are missing
    return createClient(
      supabaseUrl || 'https://placeholder.supabase.co',
      anonKey || 'placeholder-key',
      {
        global: {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
  }
  
  return createClient(supabaseUrl, anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * Marketplace types
 */
export interface MarketplaceSupplier {
  id: string
  org_id: string | null
  name: string
  vat: string | null
  vat_verified: boolean
  pec: string | null
  sdi: string | null
  iban: string | null
  phone: string | null
  email: string | null
  website: string | null
  address: string | null
  city: string | null
  postal_code: string | null
  coords: { lat: number; lng: number } | null
  categories: string[]
  coverage_km: number
  plan: 'free' | 'pro' | 'business'
  verified: boolean
  rating: number
  total_reviews: number
  logo_url: string | null
  docs: Record<string, any>
  stripe_connect_account_id: string | null
  stripe_connect_account_verified: boolean
  created_at: string
  updated_at: string
}

export interface Job {
  id: string
  admin_id: string
  supplier_id: string
  condo_id: string
  title: string
  description: string | null
  priority: 'bassa' | 'media' | 'alta'
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'closed' | 'cancelled'
  scheduled_at: string | null
  amount_est: number | null
  amount_final: number | null
  attachments: Array<{ url: string; filename: string; type: string }>
  created_at: string
  updated_at: string
}

export interface Quote {
  id: string
  job_id: string
  items: Array<{
    desc: string
    qty: number
    unit: string
    price: number
  }>
  total: number
  currency: string
  status: 'draft' | 'sent' | 'accepted' | 'rejected'
  notes: string | null
  valid_until: string | null
  created_at: string
  updated_at: string
}

export interface Invoice {
  id: string
  job_id: string
  quote_id: string | null
  pdf_url: string | null
  total: number
  paid: boolean
  paid_at: string | null
  stripe_payment_intent_id: string | null
  stripe_transfer_id: string | null
  platform_fee_amount: number
  created_at: string
  updated_at: string
}

export interface JobMessage {
  id: string
  job_id: string
  sender_user_id: string
  body: string
  attachments: Array<{ url: string; filename: string; type: string }>
  read_at: string | null
  created_at: string
}

