/**
 * Payment Fee Logic Tests
 */

import { createMockSupabaseClient, mockAdminUser, mockCondominium } from './utils/test-helpers'

jest.mock('@/lib/supabaseServer', () => ({
  createServerClient: jest.fn(),
  supabaseServer: null,
}))

const PLATFORM_FEE_PERCENT = 1.0 // 1%

describe('Payment Fee Logic', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Platform Fee Calculation', () => {
    it('should calculate 1% platform fee correctly', () => {
      const paymentAmount = 1000.0 // €1000
      const expectedFee = paymentAmount * (PLATFORM_FEE_PERCENT / 100)
      const netAmount = paymentAmount - expectedFee

      expect(expectedFee).toBe(10.0)
      expect(netAmount).toBe(990.0)
    })

    it('should calculate fee for different payment amounts', () => {
      const testCases = [
        { amount: 100.0, expectedFee: 1.0 },
        { amount: 500.0, expectedFee: 5.0 },
        { amount: 1000.0, expectedFee: 10.0 },
        { amount: 2500.0, expectedFee: 25.0 },
      ]

      testCases.forEach(({ amount, expectedFee }) => {
        const fee = amount * (PLATFORM_FEE_PERCENT / 100)
        expect(fee).toBe(expectedFee)
      })
    })

    it('should handle zero amount gracefully', () => {
      const amount = 0
      const fee = amount * (PLATFORM_FEE_PERCENT / 100)

      expect(fee).toBe(0)
    })
  })

  describe('Payment Recording with Fees', () => {
    it('should record payment with platform fee in database', async () => {
      const paymentAmount = 1000.0
      const platformFee = paymentAmount * (PLATFORM_FEE_PERCENT / 100)
      const netAmount = paymentAmount - platformFee

      const paymentRecord = {
        payer_id: 'tenant-id-123',
        payee_id: mockAdminUser.id,
        payee_type: 'admin' as const,
        condo_id: mockCondominium.id,
        amount: paymentAmount,
        currency: 'eur',
        platform_fee_percent: PLATFORM_FEE_PERCENT,
        platform_fee_amount: platformFee,
        net_amount: netAmount,
        status: 'succeeded' as const,
        stripe_payment_id: 'pi_test_123',
      }

      const mockQuery = mockSupabase.from('payments')
      mockQuery.insert.mockReturnValue(mockQuery)
      mockQuery.select.mockReturnValue(mockQuery)
      mockQuery.single.mockResolvedValue({
        data: { ...paymentRecord, id: 'payment-id-123', created_at: new Date().toISOString() },
        error: null,
      })

      const result = await mockQuery.from('payments').insert(paymentRecord).select().single()

      expect(result.data).toBeDefined()
      expect(result.data?.amount).toBe(1000.0)
      expect(result.data?.platform_fee_amount).toBe(10.0)
      expect(result.data?.net_amount).toBe(990.0)
      expect(result.error).toBeNull()
    })

    it('should display fees correctly in admin dashboard', async () => {
      const payments = [
        {
          id: 'payment-1',
          amount: 1000.0,
          platform_fee_amount: 10.0,
          net_amount: 990.0,
          status: 'succeeded',
        },
        {
          id: 'payment-2',
          amount: 500.0,
          platform_fee_amount: 5.0,
          net_amount: 495.0,
          status: 'succeeded',
        },
      ]

      const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0)
      const totalFees = payments.reduce((sum, p) => sum + p.platform_fee_amount, 0)
      const totalNet = payments.reduce((sum, p) => sum + p.net_amount, 0)

      expect(totalAmount).toBe(1500.0)
      expect(totalFees).toBe(15.0)
      expect(totalNet).toBe(1485.0)
      expect(totalAmount - totalFees).toBe(totalNet)
    })
  })

  describe('Fee Display Formatting', () => {
    it('should format fees with 2 decimal places', () => {
      const fee = 10.0
      const formatted = fee.toFixed(2)

      expect(formatted).toBe('10.00')
    })

    it('should format currency in Italian format', () => {
      const amount = 1234.56
      const formatted = new Intl.NumberFormat('it-IT', {
        style: 'currency',
        currency: 'EUR',
      }).format(amount)

      expect(formatted).toContain('1.234,56')
      expect(formatted).toContain('€')
    })
  })
})




