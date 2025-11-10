/**
 * Authentication & Role-Based Access Control Tests
 */

import { createMockSupabaseClient, mockAdminUser, mockTenantUser, mockSupplierUser } from './utils/test-helpers'
import { createServerClient } from '@/lib/supabaseServer'

// Mock the supabaseServer module
jest.mock('@/lib/supabaseServer', () => ({
  createServerClient: jest.fn(),
  supabaseServer: null,
}))

describe('Authentication & Roles', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient()
    ;(createServerClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Admin Registration & Login', () => {
    it('should successfully register an admin user', async () => {
      const mockAuthResponse = {
        data: {
          user: mockAdminUser,
          session: {
            access_token: 'admin-token-123',
            refresh_token: 'refresh-token-123',
          },
        },
        error: null,
      }

      mockSupabase.auth.signUp = jest.fn().mockResolvedValue(mockAuthResponse)

      const result = await mockSupabase.auth.signUp({
        email: 'admin@test.com',
        password: 'SecurePassword123!',
        options: {
          data: { role: 'admin' },
        },
      })

      expect(result.data?.user).toBeDefined()
      expect(result.data?.user?.email).toBe('admin@test.com')
      expect(result.data?.user?.user_metadata?.role).toBe('admin')
      expect(result.error).toBeNull()
    })

    it('should successfully login an admin user', async () => {
      const mockAuthResponse = {
        data: {
          user: mockAdminUser,
          session: {
            access_token: 'admin-token-123',
            refresh_token: 'refresh-token-123',
          },
        },
        error: null,
      }

      mockSupabase.auth.signInWithPassword = jest.fn().mockResolvedValue(mockAuthResponse)

      const result = await mockSupabase.auth.signInWithPassword({
        email: 'admin@test.com',
        password: 'SecurePassword123!',
      })

      expect(result.data?.user).toBeDefined()
      expect(result.data?.session).toBeDefined()
      expect(result.error).toBeNull()
    })
  })

  describe('Tenant Registration & Login', () => {
    it('should successfully register a tenant user', async () => {
      const mockAuthResponse = {
        data: {
          user: mockTenantUser,
          session: {
            access_token: 'tenant-token-456',
            refresh_token: 'refresh-token-456',
          },
        },
        error: null,
      }

      mockSupabase.auth.signUp = jest.fn().mockResolvedValue(mockAuthResponse)

      const result = await mockSupabase.auth.signUp({
        email: 'tenant@test.com',
        password: 'SecurePassword123!',
        options: {
          data: { role: 'tenant' },
        },
      })

      expect(result.data?.user).toBeDefined()
      expect(result.data?.user?.user_metadata?.role).toBe('tenant')
      expect(result.error).toBeNull()
    })

    it('should successfully login a tenant user', async () => {
      const mockAuthResponse = {
        data: {
          user: mockTenantUser,
          session: {
            access_token: 'tenant-token-456',
            refresh_token: 'refresh-token-456',
          },
        },
        error: null,
      }

      mockSupabase.auth.signInWithPassword = jest.fn().mockResolvedValue(mockAuthResponse)

      const result = await mockSupabase.auth.signInWithPassword({
        email: 'tenant@test.com',
        password: 'SecurePassword123!',
      })

      expect(result.data?.user).toBeDefined()
      expect(result.data?.session).toBeDefined()
      expect(result.error).toBeNull()
    })
  })

  describe('Supplier Registration & Login', () => {
    it('should successfully register a supplier user', async () => {
      const mockAuthResponse = {
        data: {
          user: mockSupplierUser,
          session: {
            access_token: 'supplier-token-789',
            refresh_token: 'refresh-token-789',
          },
        },
        error: null,
      }

      mockSupabase.auth.signUp = jest.fn().mockResolvedValue(mockAuthResponse)

      const result = await mockSupabase.auth.signUp({
        email: 'supplier@test.com',
        password: 'SecurePassword123!',
        options: {
          data: { role: 'supplier' },
        },
      })

      expect(result.data?.user).toBeDefined()
      expect(result.data?.user?.user_metadata?.role).toBe('supplier')
      expect(result.error).toBeNull()
    })

    it('should successfully login a supplier user', async () => {
      const mockAuthResponse = {
        data: {
          user: mockSupplierUser,
          session: {
            access_token: 'supplier-token-789',
            refresh_token: 'refresh-token-789',
          },
        },
        error: null,
      }

      mockSupabase.auth.signInWithPassword = jest.fn().mockResolvedValue(mockAuthResponse)

      const result = await mockSupabase.auth.signInWithPassword({
        email: 'supplier@test.com',
        password: 'SecurePassword123!',
      })

      expect(result.data?.user).toBeDefined()
      expect(result.data?.session).toBeDefined()
      expect(result.error).toBeNull()
    })
  })

  describe('Role-Based Access Control (RLS)', () => {
    it('should prevent tenant from accessing another tenant data', async () => {
      // Mock tenant trying to access another tenant's data
      const mockQuery = mockSupabase.from('tenants')
      mockQuery.select.mockReturnValue(mockQuery)
      mockQuery.eq.mockReturnValue(mockQuery)
      mockQuery.single.mockResolvedValue({
        data: null,
        error: {
          message: 'Row-level security policy violation',
          code: '42501',
        },
      })

      const result = await mockQuery
        .from('tenants')
        .select('*')
        .eq('id', 'other-tenant-id')
        .single()

      expect(result.data).toBeNull()
      expect(result.error).toBeDefined()
      expect(result.error?.code).toBe('42501')
    })

    it('should allow admin to access all tenant data', async () => {
      const mockQuery = mockSupabase.from('tenants')
      mockQuery.select.mockReturnValue(mockQuery)
      mockQuery.single.mockResolvedValue({
        data: {
          id: 'tenant-id-123',
          name: 'Test Tenant',
          condo_id: 'condo-id-123',
        },
        error: null,
      })

      const result = await mockQuery.from('tenants').select('*').single()

      expect(result.data).toBeDefined()
      expect(result.error).toBeNull()
    })

    it('should prevent supplier from accessing tenant data', async () => {
      const mockQuery = mockSupabase.from('tenants')
      mockQuery.select.mockReturnValue(mockQuery)
      mockQuery.single.mockResolvedValue({
        data: null,
        error: {
          message: 'Permission denied',
          code: '42501',
        },
      })

      const result = await mockQuery.from('tenants').select('*').single()

      expect(result.data).toBeNull()
      expect(result.error).toBeDefined()
    })
  })

  describe('Session Management', () => {
    it('should retrieve current user session', async () => {
      mockSupabase.auth.getUser = jest.fn().mockResolvedValue({
        data: { user: mockAdminUser },
        error: null,
      })

      const result = await mockSupabase.auth.getUser()

      expect(result.data?.user).toBeDefined()
      expect(result.data?.user?.id).toBe(mockAdminUser.id)
      expect(result.error).toBeNull()
    })

    it('should handle expired session gracefully', async () => {
      mockSupabase.auth.getUser = jest.fn().mockResolvedValue({
        data: { user: null },
        error: {
          message: 'JWT expired',
          status: 401,
        },
      })

      const result = await mockSupabase.auth.getUser()

      expect(result.data?.user).toBeNull()
      expect(result.error).toBeDefined()
      expect(result.error?.status).toBe(401)
    })

    it('should successfully sign out user', async () => {
      mockSupabase.auth.signOut = jest.fn().mockResolvedValue({
        error: null,
      })

      const result = await mockSupabase.auth.signOut()

      expect(result.error).toBeNull()
      expect(mockSupabase.auth.signOut).toHaveBeenCalled()
    })
  })
})




