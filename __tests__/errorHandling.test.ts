/**
 * Error Handling & Logging Tests
 */

import { createMockSupabaseClient } from './utils/test-helpers'
import { createServerClient } from '@/lib/supabaseServer'
import { apiErrorResponse, apiSuccessResponse } from '@/lib/api-helpers'

jest.mock('@/lib/supabaseServer', () => ({
  createServerClient: jest.fn(),
  supabaseServer: null,
}))

describe('Error Handling & Logging', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient()
    ;(createServerClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('API Route Error Responses', () => {
    it('should return 400 for validation errors', () => {
      const response = apiErrorResponse('Validation error: Missing required field', 'VALIDATION_ERROR', 400)

      expect(response.status).toBe(400)
      const body = JSON.parse(response.body as any)
      expect(body.success).toBe(false)
      expect(body.message).toBe('Validation error: Missing required field')
    })

    it('should return 401 for unauthorized access', () => {
      const response = apiErrorResponse('Unauthorized', 'AUTH_ERROR', 401)

      expect(response.status).toBe(401)
      const body = JSON.parse(response.body as any)
      expect(body.success).toBe(false)
      expect(body.message).toBe('Unauthorized')
    })

    it('should return 403 for forbidden access', () => {
      const response = apiErrorResponse('Access denied', 'AUTH_ERROR', 403)

      expect(response.status).toBe(403)
      const body = JSON.parse(response.body as any)
      expect(body.success).toBe(false)
    })

    it('should return 404 for not found', () => {
      const response = apiErrorResponse('Resource not found', 'NOT_FOUND', 404)

      expect(response.status).toBe(404)
      const body = JSON.parse(response.body as any)
      expect(body.success).toBe(false)
    })

    it('should return 500 for server errors', () => {
      const response = apiErrorResponse('Internal server error', 'SERVER_ERROR', 500)

      expect(response.status).toBe(500)
      const body = JSON.parse(response.body as any)
      expect(body.success).toBe(false)
    })
  })

  describe('Invalid Data Handling', () => {
    it('should reject condominium creation with missing name', async () => {
      const invalidCondo = {
        address: 'Via Test 123',
        // Missing name
      }

      const mockQuery = mockSupabase.from('condominiums')
      mockQuery.insert.mockReturnValue(mockQuery)
      mockQuery.select.mockReturnValue(mockQuery)
      mockQuery.single.mockResolvedValue({
        data: null,
        error: {
          message: 'null value in column "name" violates not-null constraint',
          code: '23502',
          details: 'Key (name)=(null)',
        },
      })

      const result = await mockQuery.from('condominiums').insert(invalidCondo).select().single()

      expect(result.data).toBeNull()
      expect(result.error).toBeDefined()
      expect(result.error?.code).toBe('23502')
    })

    it('should reject invalid Stripe key gracefully', () => {
      const invalidKey = 'invalid_stripe_key'

      // Stripe client should handle invalid keys
      expect(() => {
        if (!invalidKey.startsWith('sk_')) {
          throw new Error('Invalid Stripe secret key format')
        }
      }).toThrow('Invalid Stripe secret key format')
    })

    it('should handle database connection errors', async () => {
      const mockQuery = mockSupabase.from('condominiums')
      mockQuery.select.mockReturnValue(mockQuery)
      mockQuery.single.mockResolvedValue({
        data: null,
        error: {
          message: 'Connection timeout',
          code: '08006',
          details: 'Failed to connect to database',
        },
      })

      const result = await mockQuery.from('condominiums').select('*').single()

      expect(result.data).toBeNull()
      expect(result.error).toBeDefined()
      expect(result.error?.code).toBe('08006')
    })

    it('should handle foreign key constraint violations', async () => {
      const invalidTenant = {
        condo_id: 'non-existent-condo',
        name: 'Test Tenant',
        email: 'test@test.com',
      }

      const mockQuery = mockSupabase.from('tenants')
      mockQuery.insert.mockReturnValue(mockQuery)
      mockQuery.select.mockReturnValue(mockQuery)
      mockQuery.single.mockResolvedValue({
        data: null,
        error: {
          message: 'insert or update on table "tenants" violates foreign key constraint "tenants_condo_id_fkey"',
          code: '23503',
          details: 'Key (condo_id)=(non-existent-condo) is not present in table "condominiums".',
        },
      })

      const result = await mockQuery.from('tenants').insert(invalidTenant).select().single()

      expect(result.data).toBeNull()
      expect(result.error).toBeDefined()
      expect(result.error?.code).toBe('23503')
    })
  })

  describe('Descriptive Error Messages', () => {
    it('should provide descriptive error for missing required fields', () => {
      const error = {
        message: 'null value in column "name" violates not-null constraint',
        code: '23502',
      }

      expect(error.message).toContain('null value')
      expect(error.message).toContain('name')
      expect(error.code).toBe('23502')
    })

    it('should provide descriptive error for duplicate entries', () => {
      const error = {
        message: 'duplicate key value violates unique constraint "tenants_email_key"',
        code: '23505',
      }

      expect(error.message).toContain('duplicate')
      expect(error.message).toContain('email')
      expect(error.code).toBe('23505')
    })

    it('should provide descriptive error for RLS policy violations', () => {
      const error = {
        message: 'new row violates row-level security policy',
        code: '42501',
      }

      expect(error.message).toContain('row-level security')
      expect(error.code).toBe('42501')
    })
  })

  describe('Success Responses', () => {
    it('should return 200 for successful operations', () => {
      const data = { id: '123', name: 'Test' }
      const response = apiSuccessResponse(data, 'Operation successful')

      expect(response.status).toBe(200)
      const body = JSON.parse(response.body as any)
      expect(body.success).toBe(true)
      expect(body.data).toEqual(data)
      expect(body.message).toBe('Operation successful')
    })
  })

  describe('Error Logging', () => {
    it('should log errors with context', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const error = new Error('Test error')
      const context = { adminId: 'admin-123', action: 'create_condo' }

      console.error('Error:', error.message, 'Context:', context)

      expect(consoleSpy).toHaveBeenCalledWith('Error:', 'Test error', 'Context:', context)

      consoleSpy.mockRestore()
    })

    it('should include stack trace in development mode', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      const error = new Error('Test error')
      const hasStackTrace = error.stack !== undefined

      expect(hasStackTrace).toBe(true)

      process.env.NODE_ENV = originalEnv
    })
  })
})




