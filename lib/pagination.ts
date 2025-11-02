/**
 * Pagination Utilities
 * Handles pagination for large data queries
 */

export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrevious: boolean
  }
}

/**
 * Calculate pagination metadata
 */
export function getPaginationMetadata(
  page: number,
  pageSize: number,
  total: number
) {
  const totalPages = Math.ceil(total / pageSize)
  const hasNext = page < totalPages
  const hasPrevious = page > 1

  return {
    page,
    pageSize,
    total,
    totalPages,
    hasNext,
    hasPrevious,
  }
}

/**
 * Default pagination values
 */
export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100

/**
 * Validate and normalize pagination parameters
 */
export function normalizePagination(
  page?: number | string,
  pageSize?: number | string
): PaginationParams {
  const normalizedPage = Math.max(1, Number(page) || 1)
  let normalizedPageSize = Number(pageSize) || DEFAULT_PAGE_SIZE

  // Enforce max page size
  if (normalizedPageSize > MAX_PAGE_SIZE) {
    normalizedPageSize = MAX_PAGE_SIZE
  }

  if (normalizedPageSize < 1) {
    normalizedPageSize = DEFAULT_PAGE_SIZE
  }

  return {
    page: normalizedPage,
    pageSize: normalizedPageSize,
  }
}

/**
 * Get offset for database queries
 */
export function getOffset(page: number, pageSize: number): number {
  return (page - 1) * pageSize
}

