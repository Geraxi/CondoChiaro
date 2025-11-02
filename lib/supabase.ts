import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Only create client if we have valid credentials
let supabaseClient: ReturnType<typeof createClient> | null = null

try {
  if (supabaseUrl && supabaseUrl !== 'https://placeholder.supabase.co' && supabaseAnonKey && supabaseAnonKey !== 'placeholder-key') {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  } else {
    // Create a dummy client that will fail gracefully
    supabaseClient = createClient('https://placeholder.supabase.co', 'placeholder-key')
  }
} catch (error) {
  console.error('Error initializing Supabase client:', error)
  // Fallback to dummy client
  supabaseClient = createClient('https://placeholder.supabase.co', 'placeholder-key')
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
  created_at: string
}

export interface Document {
  id: string
  condominium_id: string
  name: string
  file_url: string
  category: string
  created_at: string
}

