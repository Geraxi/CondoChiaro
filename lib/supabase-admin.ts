import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const hasServiceRole = Boolean(supabaseUrl && supabaseServiceRoleKey)

export const supabaseAdmin = hasServiceRole
  ? createClient(supabaseUrl as string, supabaseServiceRoleKey as string, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null
