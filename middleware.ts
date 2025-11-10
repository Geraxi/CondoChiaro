import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * Next.js Middleware
 * Handles authentication, maintenance mode and other global checks
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

  // Check authentication for protected routes (before maintenance mode check)
  if (pathname.startsWith('/admin') || pathname.startsWith('/tenant') || pathname.startsWith('/supplier')) {
    const response = NextResponse.next()

    let authenticatedUser: { id: string } | null = null

    try {
      // Create Supabase client using @supabase/ssr
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              const cookies = request.cookies.getAll()
              return cookies.map(cookie => ({
                name: cookie.name,
                value: cookie.value,
              }))
            },
            setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
              cookiesToSet.forEach(({ name, value, options }) => {
                response.cookies.set(name, value, options)
              })
            },
          },
        }
      )

      // Check if user is authenticated
      const { data: { user }, error } = await supabase.auth.getUser()

      // Redirect unauthenticated users to login
      if (!user || error) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
      }

      // Store authenticated user for maintenance mode check
      authenticatedUser = user
    } catch (error) {
      console.error('Middleware authentication error:', error)
      // On error, redirect to login for safety
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Check maintenance mode for protected routes (after authentication check)
    try {
      // Import dynamically to avoid SSR issues
      const { checkMaintenanceMode, canBypassMaintenance } = await import('@/lib/maintenance-mode')
      const maintenance = await checkMaintenanceMode()

      if (maintenance.enabled && authenticatedUser) {
        // Check if user can bypass maintenance (e.g., admin)
        const canBypass = await canBypassMaintenance(authenticatedUser.id)

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
      console.error('Middleware maintenance mode error:', error)
      // Don't block requests on middleware errors, but log them
    }

    return response
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







