import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Next.js Middleware
 * Handles maintenance mode and other global checks
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Skip middleware for static files, API routes (except health), and auth routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/videos') ||
    pathname.startsWith('/api/health') ||
    pathname.startsWith('/api/auth') ||
    pathname === '/login' ||
    pathname === '/register'
  ) {
    return NextResponse.next()
  }

  // Check maintenance mode for protected routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/tenant') || pathname.startsWith('/supplier')) {
    try {
      // Import dynamically to avoid SSR issues
      const { checkMaintenanceMode, canBypassMaintenance } = await import('@/lib/maintenance-mode')
      const maintenance = await checkMaintenanceMode()

      if (maintenance.enabled) {
        // Check if user is admin (can bypass)
        const token = request.cookies.get('sb-access-token')?.value
        let canBypass = false

        if (token) {
          try {
            const { createClient } = await import('@supabase/supabase-js')
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
            const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

            if (supabaseUrl && supabaseAnonKey) {
              const supabase = createClient(supabaseUrl, supabaseAnonKey)
              const { data: { user } } = await supabase.auth.getUser(token)
              
              if (user) {
                canBypass = await canBypassMaintenance(user.id)
              }
            }
          } catch (error) {
            console.error('Error checking user bypass:', error)
          }
        }

        if (!canBypass) {
          return NextResponse.json(
            {
              success: false,
              message: maintenance.message || 'System is temporarily unavailable for maintenance',
              error: { code: 'MAINTENANCE_MODE' },
            },
            { status: 503 }
          )
        }
      }
    } catch (error) {
      console.error('Middleware error:', error)
      // Don't block requests on middleware errors
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}







