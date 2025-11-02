import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Next.js Middleware
 * Handles authentication, maintenance mode, and route protection
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
    pathname === '/register' ||
    pathname === '/reset-password' ||
    pathname === '/' ||
    pathname.startsWith('/demo')
  ) {
    return NextResponse.next()
  }

  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // If Supabase is not configured, allow all requests (development mode)
    return NextResponse.next()
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  try {
    // Get user from session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      // User is not authenticated, redirect to login
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Check maintenance mode for protected routes
    if (pathname.startsWith('/admin') || pathname.startsWith('/tenant') || pathname.startsWith('/supplier')) {
      try {
        const { checkMaintenanceMode, canBypassMaintenance } = await import('@/lib/maintenance-mode')
        const maintenance = await checkMaintenanceMode()

        if (maintenance.enabled) {
          // Check if user is admin (can bypass)
          let canBypass = false

          if (session.user) {
            canBypass = await canBypassMaintenance(session.user.id)
          }

          if (!canBypass) {
            return NextResponse.json(
              {
                success: false,
                message: maintenance.message || 'Sistema temporaneamente non disponibile per manutenzione',
                error: { code: 'MAINTENANCE_MODE' },
              },
              { status: 503 }
            )
          }
        }
      } catch (error) {
        console.error('Error checking maintenance mode:', error)
        // Don't block requests on maintenance mode errors
      }

      // Check role-based access
      const userRole = session.user.user_metadata?.role || 'tenant'

      // Admin routes
      if (pathname.startsWith('/admin') && userRole !== 'admin') {
        return NextResponse.redirect(new URL(`/${userRole}/dashboard`, request.url))
      }

      // Tenant routes
      if (pathname.startsWith('/tenant') && userRole !== 'tenant' && userRole !== 'admin') {
        return NextResponse.redirect(new URL(`/${userRole}/dashboard`, request.url))
      }

      // Supplier routes
      if (pathname.startsWith('/supplier') && userRole !== 'supplier' && userRole !== 'admin') {
        return NextResponse.redirect(new URL(`/${userRole}/dashboard`, request.url))
      }
    }

  } catch (error) {
    console.error('Middleware error:', error)
    // On errors, don't block the request but log the issue
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

