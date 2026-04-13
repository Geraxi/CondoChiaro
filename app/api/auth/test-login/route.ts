import { NextResponse } from 'next/server'
import {
  buildTestSessionValue,
  findTestCredential,
  isSafeInternalRedirect,
  isTestAuthEnabled,
  TEST_AUTH_COOKIE_NAME,
} from '@/lib/dev-test-auth'

export async function POST(request: Request) {
  if (!isTestAuthEnabled()) {
    return NextResponse.json({ success: false, message: 'Test login disabled' }, { status: 403 })
  }

  let payload: { email?: string; password?: string; redirect?: string }
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid request payload' }, { status: 400 })
  }

  const email = payload.email ?? ''
  const password = payload.password ?? ''

  const credential = findTestCredential(email, password)
  if (!credential) {
    return NextResponse.json({ success: false, message: 'Credenziali non valide' }, { status: 401 })
  }

  const redirectTo =
    isSafeInternalRedirect(payload.redirect) && payload.redirect
      ? payload.redirect
      : credential.defaultRedirect

  const response = NextResponse.json({
    success: true,
    redirectTo,
    role: credential.role,
  })

  response.cookies.set(TEST_AUTH_COOKIE_NAME, buildTestSessionValue(credential.role), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8,
  })

  return response
}
