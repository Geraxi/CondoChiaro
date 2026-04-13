export type TestUserRole = 'admin' | 'tenant' | 'supplier'

export interface TestCredential {
  email: string
  password: string
  role: TestUserRole
  defaultRedirect: string
}

export const TEST_AUTH_COOKIE_NAME = 'cc_test_session'

const TEST_AUTH_COOKIE_PREFIX = 'v1'

export const TEST_CREDENTIALS: TestCredential[] = [
  {
    email: 'admin@test.com',
    password: 'SecurePassword123!',
    role: 'admin',
    defaultRedirect: '/admin/dashboard',
  },
  {
    email: 'tenant@test.com',
    password: 'SecurePassword123!',
    role: 'tenant',
    defaultRedirect: '/tenant/dashboard',
  },
  {
    email: 'supplier@test.com',
    password: 'SecurePassword123!',
    role: 'supplier',
    defaultRedirect: '/supplier/dashboard',
  },
]

export function isTestAuthEnabled(): boolean {
  return process.env.NODE_ENV !== 'production' || process.env.ENABLE_TEST_LOGIN === 'true'
}

export function findTestCredential(email: string, password: string): TestCredential | null {
  const normalizedEmail = email.trim().toLowerCase()
  return (
    TEST_CREDENTIALS.find(
      (credential) => credential.email.toLowerCase() === normalizedEmail && credential.password === password
    ) ?? null
  )
}

export function buildTestSessionValue(role: TestUserRole): string {
  return `${TEST_AUTH_COOKIE_PREFIX}:${role}`
}

export function parseTestSessionRole(value?: string): TestUserRole | null {
  if (!value) return null
  const [prefix, role] = value.split(':')
  if (prefix !== TEST_AUTH_COOKIE_PREFIX) return null
  if (role === 'admin' || role === 'tenant' || role === 'supplier') return role
  return null
}

export function isRoleAllowedForPath(role: TestUserRole, pathname: string): boolean {
  if (pathname.startsWith('/admin')) return role === 'admin'
  if (pathname.startsWith('/tenant')) return role === 'tenant'
  if (pathname.startsWith('/supplier')) return role === 'supplier'
  return true
}

export function getRedirectForRole(role: TestUserRole): string {
  return TEST_CREDENTIALS.find((credential) => credential.role === role)?.defaultRedirect ?? '/login'
}

export function isSafeInternalRedirect(path?: string): boolean {
  return Boolean(path && path.startsWith('/') && !path.startsWith('//'))
}
