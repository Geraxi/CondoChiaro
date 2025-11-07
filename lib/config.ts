const toNumber = (value: string | undefined, fallback: number) => {
  const parsed = value !== undefined ? Number(value) : fallback
  return Number.isFinite(parsed) ? parsed : fallback
}

export const BASE_SUBSCRIPTION_FEE = toNumber(process.env.BASE_FEE, 29.99)
export const PER_CONDO_FEE = toNumber(process.env.PER_CONDO_FEE, 8)
export const PLATFORM_FEE_PERCENT = toNumber(process.env.PLATFORM_FEE_PERCENT, 1)
export const STRIPE_PLATFORM_FEE_PERCENT = PLATFORM_FEE_PERCENT
export const STRIPE_CONNECT_ENABLED =
  process.env.STRIPE_CONNECT_ENABLED === undefined
    ? true
    : process.env.STRIPE_CONNECT_ENABLED.toLowerCase() === 'true'

export const STRIPE_DEFAULT_CURRENCY = process.env.STRIPE_DEFAULT_CURRENCY ?? 'eur'
export const STRIPE_SUPPLIER_PRO_PRICE = toNumber(process.env.SUPPLIER_PRO_PRICE, 9.99)

export function eurosToCents(amount: number): number {
  return Math.round(amount * 100)
}

export function calculateSubscriptionTotal(condoCount: number) {
  const base = BASE_SUBSCRIPTION_FEE
  const perCondo = PER_CONDO_FEE
  const total = base + Math.max(condoCount, 0) * perCondo
  return {
    base,
    perCondo,
    condoCount: Math.max(condoCount, 0),
    total,
  }
}

export function calculatePlatformFees(amount: number) {
  const safeAmount = Math.max(amount, 0)
  const platformFee = (safeAmount * STRIPE_PLATFORM_FEE_PERCENT) / 100
  const stripeFeePercent = toNumber(process.env.STRIPE_CARD_FEE_PERCENT, 0.25)
  const stripeFee = (safeAmount * stripeFeePercent) / 100
  const net = platformFee - stripeFee
  return {
    platformFeePercent: STRIPE_PLATFORM_FEE_PERCENT,
    platformFee,
    stripeFeePercent,
    stripeFee,
    net,
  }
}
