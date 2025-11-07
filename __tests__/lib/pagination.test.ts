import {
  getPaginationMetadata,
  normalizePagination,
  getOffset,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from '@/lib/pagination'

describe('Pagination Utilities', () => {
  describe('getPaginationMetadata', () => {
    it('should calculate correct pagination metadata', () => {
      const result = getPaginationMetadata(2, 20, 100)

      expect(result).toEqual({
        page: 2,
        pageSize: 20,
        total: 100,
        totalPages: 5,
        hasNext: true,
        hasPrevious: true,
      })
    })

    it('should indicate no next page on last page', () => {
      const result = getPaginationMetadata(5, 20, 100)

      expect(result.hasNext).toBe(false)
      expect(result.hasPrevious).toBe(true)
    })

    it('should indicate no previous page on first page', () => {
      const result = getPaginationMetadata(1, 20, 100)

      expect(result.hasNext).toBe(true)
      expect(result.hasPrevious).toBe(false)
    })
  })

  describe('normalizePagination', () => {
    it('should use default values when not provided', () => {
      const result = normalizePagination()

      expect(result.page).toBe(1)
      expect(result.pageSize).toBe(DEFAULT_PAGE_SIZE)
    })

    it('should handle string inputs', () => {
      const result = normalizePagination('2', '30')

      expect(result.page).toBe(2)
      expect(result.pageSize).toBe(30)
    })

    it('should enforce minimum page of 1', () => {
      const result = normalizePagination(0, 20)

      expect(result.page).toBe(1)
    })

    it('should enforce maximum page size', () => {
      const result = normalizePagination(1, 200)

      expect(result.pageSize).toBe(MAX_PAGE_SIZE)
    })

    it('should use default page size for invalid values', () => {
      const result = normalizePagination(1, -5)

      expect(result.pageSize).toBe(DEFAULT_PAGE_SIZE)
    })
  })

  describe('getOffset', () => {
    it('should calculate correct offset', () => {
      expect(getOffset(1, 20)).toBe(0)
      expect(getOffset(2, 20)).toBe(20)
      expect(getOffset(3, 20)).toBe(40)
    })
  })
})







