import { NextResponse } from 'next/server'
import { TEST_AUTH_COOKIE_NAME } from '@/lib/dev-test-auth'

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.set(TEST_AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  })

  return response
}
