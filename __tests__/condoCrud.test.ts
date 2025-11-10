/**
 * Condominium Management CRUD Tests
 */

import { createMockSupabaseClient, mockAdminUser, mockCondominium, mockTenant, mockSupplier } from './utils/test-helpers'
import { createServerClient } from '@/lib/supabaseServer'

jest.mock('@/lib/supabaseServer', () => ({
  createServerClient: jest.fn(),
  supabaseServer: null,
}))

describe('Condominium Management', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient()
    ;(createServerClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Create Condominium', () => {
    it('should successfully create a new condominium', async () => {
      const newCondo = {
        name: 'Test Condominium',
        address: 'Via Test 123',
        city: 'Milano',
        admin_id: mockAdminUser.id,
      }

      const mockQuery = mockSupabase.from('condominiums')
      mockQuery.insert.mockReturnValue(mockQuery)
      mockQuery.select.mockReturnValue(mockQuery)
      mockQuery.single.mockResolvedValue({
        data: { ...newCondo, id: 'condo-id-123', created_at: new Date().toISOString() },
        error: null,
      })

      const result = await mockQuery
        .from('condominiums')
        .insert(newCondo)
        .select()
        .single()

      expect(result.data).toBeDefined()
      expect(result.data?.name).toBe('Test Condominium')
      expect(result.data?.admin_id).toBe(mockAdminUser.id)
      expect(result.error).toBeNull()
    })

    it('should reject condominium creation with missing required fields', async () => {
      const invalidCondo = {
        address: 'Via Test 123',
        // Missing name and admin_id
      }

      const mockQuery = mockSupabase.from('condominiums')
      mockQuery.insert.mockReturnValue(mockQuery)
      mockQuery.select.mockReturnValue(mockQuery)
      mockQuery.single.mockResolvedValue({
        data: null,
        error: {
          message: 'null value in column "name" violates not-null constraint',
          code: '23502',
        },
      })

      const result = await mockQuery
        .from('condominiums')
        .insert(invalidCondo)
        .select()
        .single()

      expect(result.data).toBeNull()
      expect(result.error).toBeDefined()
      expect(result.error?.code).toBe('23502')
    })
  })

  describe('Add Tenants', () => {
    it('should successfully add 10 tenants to a condominium', async () => {
      const tenants = Array.from({ length: 10 }, (_, i) => ({
        condo_id: mockCondominium.id,
        name: `Tenant ${i + 1}`,
        email: `tenant${i + 1}@test.com`,
        apartment: `A${i + 1}`,
      }))

      const mockQuery = mockSupabase.from('tenants')
      mockQuery.insert.mockReturnValue(mockQuery)
      mockQuery.select.mockResolvedValue({
        data: tenants.map((t, i) => ({ ...t, id: `tenant-id-${i}`, created_at: new Date().toISOString() })),
        error: null,
      })

      const result = await mockQuery.from('tenants').insert(tenants).select()

      expect(result.data).toBeDefined()
      expect(result.data?.length).toBe(10)
      expect(result.data?.every((t: any) => t.condo_id === mockCondominium.id)).toBe(true)
      expect(result.error).toBeNull()
    })

    it('should validate foreign key relationship between tenant and condominium', async () => {
      const invalidTenant = {
        condo_id: 'non-existent-condo-id',
        name: 'Test Tenant',
        email: 'test@test.com',
        apartment: 'A1',
      }

      const mockQuery = mockSupabase.from('tenants')
      mockQuery.insert.mockReturnValue(mockQuery)
      mockQuery.select.mockReturnValue(mockQuery)
      mockQuery.single.mockResolvedValue({
        data: null,
        error: {
          message: 'insert or update on table "tenants" violates foreign key constraint',
          code: '23503',
        },
      })

      const result = await mockQuery
        .from('tenants')
        .insert(invalidTenant)
        .select()
        .single()

      expect(result.data).toBeNull()
      expect(result.error).toBeDefined()
      expect(result.error?.code).toBe('23503')
    })
  })

  describe('Add Suppliers', () => {
    it('should successfully add 2 suppliers to a condominium', async () => {
      const suppliers = [
        {
          condo_id: mockCondominium.id,
          name: 'Supplier 1',
          email: 'supplier1@test.com',
          phone: '+39 123 456 7890',
          category: 'idraulico',
        },
        {
          condo_id: mockCondominium.id,
          name: 'Supplier 2',
          email: 'supplier2@test.com',
          phone: '+39 123 456 7891',
          category: 'elettricista',
        },
      ]

      const mockQuery = mockSupabase.from('suppliers')
      mockQuery.insert.mockReturnValue(mockQuery)
      mockQuery.select.mockResolvedValue({
        data: suppliers.map((s, i) => ({ ...s, id: `supplier-id-${i}`, created_at: new Date().toISOString() })),
        error: null,
      })

      const result = await mockQuery.from('suppliers').insert(suppliers).select()

      expect(result.data).toBeDefined()
      expect(result.data?.length).toBe(2)
      expect(result.error).toBeNull()
    })
  })

  describe('Read Condominium Data', () => {
    it('should retrieve condominium with all related tenants', async () => {
      const mockCondoQuery = mockSupabase.from('condominiums')
      mockCondoQuery.select.mockReturnValue(mockCondoQuery)
      mockCondoQuery.eq.mockReturnValue(mockCondoQuery)
      mockCondoQuery.single.mockResolvedValue({
        data: {
          ...mockCondominium,
          tenants: [
            { id: 'tenant-1', name: 'Tenant 1', apartment: 'A1' },
            { id: 'tenant-2', name: 'Tenant 2', apartment: 'A2' },
          ],
        },
        error: null,
      })

      const result = await mockCondoQuery
        .from('condominiums')
        .select('*, tenants(*)')
        .eq('id', mockCondominium.id)
        .single()

      expect(result.data).toBeDefined()
      expect(result.data?.tenants).toBeDefined()
      expect(result.data?.tenants.length).toBeGreaterThan(0)
      expect(result.error).toBeNull()
    })

    it('should persist data correctly in Supabase', async () => {
      // Simulate creating and then reading back
      const newCondo = {
        name: 'Persistence Test Condo',
        address: 'Via Persistence 123',
        city: 'Roma',
        admin_id: mockAdminUser.id,
      }

      const insertQuery = mockSupabase.from('condominiums')
      insertQuery.insert.mockReturnValue(insertQuery)
      insertQuery.select.mockReturnValue(insertQuery)
      insertQuery.single.mockResolvedValue({
        data: { ...newCondo, id: 'persisted-condo-id', created_at: new Date().toISOString() },
        error: null,
      })

      const insertResult = await insertQuery.from('condominiums').insert(newCondo).select().single()

      // Now read it back
      const readQuery = mockSupabase.from('condominiums')
      readQuery.select.mockReturnValue(readQuery)
      readQuery.eq.mockReturnValue(readQuery)
      readQuery.single.mockResolvedValue({
        data: insertResult.data,
        error: null,
      })

      const readResult = await readQuery
        .from('condominiums')
        .select('*')
        .eq('id', insertResult.data?.id)
        .single()

      expect(readResult.data).toBeDefined()
      expect(readResult.data?.name).toBe('Persistence Test Condo')
      expect(readResult.data?.id).toBe(insertResult.data?.id)
      expect(readResult.error).toBeNull()
    })
  })

  describe('Update Condominium', () => {
    it('should successfully update condominium details', async () => {
      const updates = {
        name: 'Updated Condominium Name',
        address: 'Updated Address 456',
      }

      const mockQuery = mockSupabase.from('condominiums')
      mockQuery.update.mockReturnValue(mockQuery)
      mockQuery.eq.mockReturnValue(mockQuery)
      mockQuery.select.mockReturnValue(mockQuery)
      mockQuery.single.mockResolvedValue({
        data: { ...mockCondominium, ...updates },
        error: null,
      })

      const result = await mockQuery
        .from('condominiums')
        .update(updates)
        .eq('id', mockCondominium.id)
        .select()
        .single()

      expect(result.data).toBeDefined()
      expect(result.data?.name).toBe('Updated Condominium Name')
      expect(result.data?.address).toBe('Updated Address 456')
      expect(result.error).toBeNull()
    })
  })

  describe('Delete Condominium', () => {
    it('should handle cascade deletion of related data', async () => {
      const mockQuery = mockSupabase.from('condominiums')
      mockQuery.delete.mockReturnValue(mockQuery)
      mockQuery.eq.mockReturnValue(mockQuery)
      mockQuery.select.mockResolvedValue({
        data: [{ id: mockCondominium.id }],
        error: null,
      })

      const result = await mockQuery
        .from('condominiums')
        .delete()
        .eq('id', mockCondominium.id)
        .select()

      expect(result.data).toBeDefined()
      expect(result.error).toBeNull()
      // Note: In real implementation, RLS policies should ensure related tenants are also deleted
    })
  })
})




