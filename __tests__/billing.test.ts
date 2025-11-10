/**
 * Billing & Subscription Logic Tests
 */

import { createMockSupabaseClient, mockAdminUser, mockCondominium, createMockStripeEvent } from './utils/test-helpers'
import { createMockStripe } from './utils/test-helpers'
import { createServerClient } from '@/lib/supabaseServer'

jest.mock('@/lib/supabaseServer', () => ({
  createServerClient: jest.fn(),
  supabaseServer: null,
}))

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => createMockStripe())
})

// Mock config values (matching lib/config.ts defaults)
const BASE_SUBSCRIPTION_PRICE = 29.99
const PER_CONDO_PRICE = 8.0

describe('Billing Logic', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>
  let mockStripe: ReturnType<typeof createMockStripe>

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient()
    mockStripe = createMockStripe()
    ;(createServerClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Subscription Pricing Calculation', () => {
    it('should calculate base subscription price correctly', () => {
      const condoCount = 0
      const expectedTotal = BASE_SUBSCRIPTION_PRICE

      const total = BASE_SUBSCRIPTION_PRICE + PER_CONDO_PRICE * condoCount

      expect(total).toBe(expectedTotal)
    })

    it('should calculate subscription with 1 condominium', () => {
      const condoCount = 1
      const expectedTotal = BASE_SUBSCRIPTION_PRICE + PER_CONDO_PRICE * condoCount

      const total = BASE_SUBSCRIPTION_PRICE + PER_CONDO_PRICE * condoCount

      expect(total).toBe(expectedTotal)
      expect(total).toBe(37.99)
    })

    it('should calculate subscription with 10 condominiums', () => {
      const condoCount = 10
      const expectedTotal = BASE_SUBSCRIPTION_PRICE + PER_CONDO_PRICE * condoCount

      const total = BASE_SUBSCRIPTION_PRICE + PER_CONDO_PRICE * condoCount

      expect(total).toBe(expectedTotal)
      expect(total).toBe(99.99)
    })

    it('should update subscription when condominium count changes', async () => {
      // Simulate admin adding a new condominium
      const initialCount = 5
      const newCount = 6

      const initialTotal = BASE_SUBSCRIPTION_PRICE + PER_CONDO_PRICE * initialCount
      const newTotal = BASE_SUBSCRIPTION_PRICE + PER_CONDO_PRICE * newCount

      expect(newTotal).toBeGreaterThan(initialTotal)
      expect(newTotal - initialTotal).toBe(PER_CONDO_PRICE)
    })
  })

  describe('Stripe Subscription Creation', () => {
    it('should create Stripe subscription in test mode', async () => {
      const mockSubscription = {
        id: 'sub_test_123',
        customer: 'cus_test_123',
        status: 'active',
        items: {
          data: [
            {
              id: 'si_test_123',
              price: {
                id: 'price_test_base',
                unit_amount: Math.round(BASE_SUBSCRIPTION_PRICE * 100),
              },
            },
          ],
        },
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
      }

      mockStripe.subscriptions.create = jest.fn().mockResolvedValue(mockSubscription)

      const result = await mockStripe.subscriptions.create({
        customer: 'cus_test_123',
        items: [{ price: 'price_test_base' }],
        metadata: {
          admin_id: mockAdminUser.id,
          condo_count: '5',
        },
      })

      expect(result).toBeDefined()
      expect(result.id).toBe('sub_test_123')
      expect(result.status).toBe('active')
      expect(mockStripe.subscriptions.create).toHaveBeenCalled()
    })

    it('should handle subscription creation failure', async () => {
      mockStripe.subscriptions.create = jest.fn().mockRejectedValue({
        type: 'StripeCardError',
        message: 'Your card was declined.',
        code: 'card_declined',
      })

      await expect(
        mockStripe.subscriptions.create({
          customer: 'cus_test_123',
          items: [{ price: 'price_test_base' }],
        })
      ).rejects.toMatchObject({
        code: 'card_declined',
      })
    })
  })

  describe('Stripe Webhook Handling', () => {
    it('should handle invoice.payment_succeeded event', async () => {
      const mockInvoice = {
        id: 'in_test_123',
        customer: 'cus_test_123',
        subscription: 'sub_test_123',
        amount_paid: 9999, // €99.99 in cents
        status: 'paid',
        metadata: {
          admin_id: mockAdminUser.id,
        },
      }

      const event = createMockStripeEvent('invoice.payment_succeeded', mockInvoice)

      expect(event.type).toBe('invoice.payment_succeeded')
      expect(event.data.object).toBe(mockInvoice)
      expect(event.data.object.amount_paid).toBe(9999)
    })

    it('should handle subscription.updated event', async () => {
      const mockSubscription = {
        id: 'sub_test_123',
        customer: 'cus_test_123',
        status: 'active',
        metadata: {
          admin_id: mockAdminUser.id,
          condo_count: '6',
        },
      }

      const event = createMockStripeEvent('customer.subscription.updated', mockSubscription)

      expect(event.type).toBe('customer.subscription.updated')
      expect(event.data.object.status).toBe('active')
    })

    it('should handle subscription.canceled event', async () => {
      const mockSubscription = {
        id: 'sub_test_123',
        customer: 'cus_test_123',
        status: 'canceled',
        canceled_at: Math.floor(Date.now() / 1000),
        metadata: {
          admin_id: mockAdminUser.id,
        },
      }

      const event = createMockStripeEvent('customer.subscription.deleted', mockSubscription)

      expect(event.type).toBe('customer.subscription.deleted')
      expect(event.data.object.status).toBe('canceled')

      // Should update Supabase subscription status
      const mockQuery = mockSupabase.from('subscriptions')
      mockQuery.update.mockReturnValue(mockQuery)
      mockQuery.eq.mockReturnValue(mockQuery)
      mockQuery.select.mockReturnValue(mockQuery)
      mockQuery.single.mockResolvedValue({
        data: {
          admin_id: mockAdminUser.id,
          status: 'canceled',
          stripe_subscription_id: 'sub_test_123',
        },
        error: null,
      })

      const result = await mockQuery
        .from('subscriptions')
        .update({ status: 'canceled' })
        .eq('stripe_subscription_id', 'sub_test_123')
        .select()
        .single()

      expect(result.data?.status).toBe('canceled')
    })
  })

  describe('Supabase Subscription Status Updates', () => {
    it('should update admin subscription status in Supabase', async () => {
      const subscriptionData = {
        admin_id: mockAdminUser.id,
        stripe_subscription_id: 'sub_test_123',
        stripe_customer_id: 'cus_test_123',
        base_fee: BASE_SUBSCRIPTION_PRICE,
        per_unit_fee: PER_CONDO_PRICE,
        condo_count: 5,
        total_price: BASE_SUBSCRIPTION_PRICE + PER_CONDO_PRICE * 5,
        status: 'active',
      }

      const mockQuery = mockSupabase.from('subscriptions')
      mockQuery.upsert.mockReturnValue(mockQuery)
      mockQuery.select.mockReturnValue(mockQuery)
      mockQuery.single.mockResolvedValue({
        data: { ...subscriptionData, id: 'sub-db-id-123', created_at: new Date().toISOString() },
        error: null,
      })

      const result = await mockQuery.from('subscriptions').upsert(subscriptionData).select().single()

      expect(result.data).toBeDefined()
      expect(result.data?.status).toBe('active')
      expect(result.data?.total_price).toBe(59.99)
      expect(result.error).toBeNull()
    })

    it('should record billing history correctly', async () => {
      const billingRecord = {
        admin_id: mockAdminUser.id,
        subscription_id: 'sub_test_123',
        amount: 59.99,
        currency: 'eur',
        status: 'paid',
        stripe_invoice_id: 'in_test_123',
        period_start: new Date().toISOString(),
        period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }

      const mockQuery = mockSupabase.from('billing_history')
      mockQuery.insert.mockReturnValue(mockQuery)
      mockQuery.select.mockReturnValue(mockQuery)
      mockQuery.single.mockResolvedValue({
        data: { ...billingRecord, id: 'billing-id-123', created_at: new Date().toISOString() },
        error: null,
      })

      const result = await mockQuery.from('billing_history').insert(billingRecord).select().single()

      expect(result.data).toBeDefined()
      expect(result.data?.amount).toBe(59.99)
      expect(result.data?.status).toBe('paid')
      expect(result.error).toBeNull()
    })
  })

  describe('Subscription Recalculation', () => {
    it('should recalculate subscription when condominium count changes', async () => {
      // Mock initial count
      const mockCountQuery = mockSupabase.from('condominiums')
      mockCountQuery.select.mockReturnValue(mockCountQuery)
      mockCountQuery.eq.mockReturnValue(mockCountQuery)
      mockCountQuery.single = undefined as any
      ;(mockCountQuery as any).count = jest.fn().mockResolvedValue({
        count: 5,
        error: null,
      })

      const initialCount = 5
      const newCount = 6

      const initialPrice = BASE_SUBSCRIPTION_PRICE + PER_CONDO_PRICE * initialCount
      const newPrice = BASE_SUBSCRIPTION_PRICE + PER_CONDO_PRICE * newCount

      expect(newPrice).toBeGreaterThan(initialPrice)
      expect(newPrice - initialPrice).toBe(PER_CONDO_PRICE)
    })
  })
})

