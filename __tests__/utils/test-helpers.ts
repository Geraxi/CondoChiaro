/**
 * Test utilities and helpers for backend integration tests
 */

import { SupabaseClient } from '@supabase/supabase-js'

export interface MockSupabaseClient extends Partial<SupabaseClient> {
  from: jest.Mock
  auth: {
    getUser: jest.Mock
    signUp: jest.Mock
    signInWithPassword: jest.Mock
    signOut: jest.Mock
  }
  storage: {
    from: jest.Mock
  }
}

export function createMockSupabaseClient(): MockSupabaseClient {
  const mockFrom = jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    like: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    contains: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    single: jest.fn(),
    maybeSingle: jest.fn(),
  }))

  return {
    from: mockFrom,
    auth: {
      getUser: jest.fn(),
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
    },
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        download: jest.fn(),
        remove: jest.fn(),
        createSignedUrl: jest.fn(),
        list: jest.fn(),
      })),
    },
  } as MockSupabaseClient
}

export function createMockStripe() {
  return {
    customers: {
      create: jest.fn(),
      retrieve: jest.fn(),
      update: jest.fn(),
      list: jest.fn(),
    },
    subscriptions: {
      create: jest.fn(),
      retrieve: jest.fn(),
      update: jest.fn(),
      cancel: jest.fn(),
      list: jest.fn(),
    },
    paymentIntents: {
      create: jest.fn(),
      retrieve: jest.fn(),
      update: jest.fn(),
    },
    checkout: {
      sessions: {
        create: jest.fn(),
        retrieve: jest.fn(),
      },
    },
    transfers: {
      create: jest.fn(),
    },
    webhooks: {
      constructEvent: jest.fn(),
    },
  }
}

export const mockAdminUser = {
  id: 'admin-user-id-123',
  email: 'admin@test.com',
  role: 'admin',
  user_metadata: { role: 'admin' },
}

export const mockTenantUser = {
  id: 'tenant-user-id-456',
  email: 'tenant@test.com',
  role: 'tenant',
  user_metadata: { role: 'tenant' },
}

export const mockSupplierUser = {
  id: 'supplier-user-id-789',
  email: 'supplier@test.com',
  role: 'supplier',
  user_metadata: { role: 'supplier' },
}

export const mockCondominium = {
  id: 'condo-id-123',
  name: 'Test Condominium',
  address: 'Via Test 123',
  city: 'Milano',
  admin_id: mockAdminUser.id,
  created_at: new Date().toISOString(),
}

export const mockTenant = {
  id: 'tenant-id-123',
  condo_id: mockCondominium.id,
  name: 'Test Tenant',
  email: 'tenant@test.com',
  apartment: 'A1',
  user_id: mockTenantUser.id,
}

export const mockSupplier = {
  id: 'supplier-id-123',
  name: 'Test Supplier',
  email: 'supplier@test.com',
  phone: '+39 123 456 7890',
  categories: ['idraulico', 'elettricista'],
  verified: true,
  rating: 4.5,
  total_reviews: 10,
}

export function createMockExcelData() {
  return {
    'Unità Abitative': [
      ['Appartamento', 'Condòmino', 'Email', 'Telefono', 'IBAN'],
      ['A1', 'Mario Rossi', 'mario@test.com', '+39 123 456 7890', 'IT60X0542811101000000123456'],
      ['A2', 'Luigi Bianchi', 'luigi@test.com', '+39 123 456 7891', 'IT60X0542811101000000123457'],
      ['A3', 'Giuseppe Verdi', 'giuseppe@test.com', '+39 123 456 7892', 'IT60X0542811101000000123458'],
    ],
  }
}

export function createMockStripeEvent(type: string, data: any) {
  return {
    id: `evt_${Math.random().toString(36).substr(2, 9)}`,
    type,
    data: {
      object: data,
    },
    created: Math.floor(Date.now() / 1000),
  }
}




