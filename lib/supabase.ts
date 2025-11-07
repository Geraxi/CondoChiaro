import { createClient, SupabaseClient } from '@supabase/supabase-js'

type SupabaseDatabase = any

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Only create client if we have valid credentials
let supabaseClient: SupabaseClient<SupabaseDatabase> | null = null

try {
  if (supabaseUrl && supabaseUrl !== 'https://placeholder.supabase.co' && supabaseAnonKey && supabaseAnonKey !== 'placeholder-key') {
    supabaseClient = createClient<SupabaseDatabase>(supabaseUrl, supabaseAnonKey)
  } else {
    // Create a dummy client that will fail gracefully
    supabaseClient = createClient<SupabaseDatabase>('https://placeholder.supabase.co', 'placeholder-key')
  }
} catch (error) {
  console.error('Error initializing Supabase client:', error)
  // Fallback to dummy client
  supabaseClient = createClient<SupabaseDatabase>('https://placeholder.supabase.co', 'placeholder-key')
}

export const supabase = supabaseClient!

// Database types
export interface Condominium {
  id: string
  name: string
  address: string
  units_count: number
  total_tenants: number
  monthly_revenue: number
  image_url?: string
  created_at: string
  admin_id: string
}

export interface Tenant {
  id: string
  condominium_id: string
  apartment_id?: string
  name: string
  surname: string
  email: string
  phone?: string
  payment_status: string
  created_at: string
  stripe_customer_id?: string
}

export interface Apartment {
  id: string
  condominium_id: string
  floor?: string
  unit_number: string
  internal_number?: string
  size_mq?: number
  owner_name?: string
  created_at: string
}

export interface Supplier {
  id: string
  condominium_id: string
  name: string
  email?: string
  phone?: string
  service_type: string
  plan?: 'free' | 'pro' | 'business'
  plan_status?: string
  stripe_customer_id?: string
  stripe_subscription_id?: string
  stripe_connect_account_id?: string
  plan_renewal_at?: string
  created_at: string
  updated_at?: string
}

export interface Document {
  id: string
  condominium_id: string
  name: string
  file_url: string
  file_type?: string
  category: string
  created_at: string
}
