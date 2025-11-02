import { successResponse, errorResponse, handleApiError } from '@/lib/api-response'

describe('API Response Utilities', () => {
  describe('successResponse', () => {
    it('should create a success response with data', () => {
      const data = { id: 1, name: 'Test' }
      const response = successResponse(data, 'Operation successful')

      expect(response).toEqual({
        success: true,
        message: 'Operation successful',
        data,
      })
    })

    it('should use default message if not provided', () => {
      const response = successResponse({})

      expect(response.success).toBe(true)
      expect(response.message).toBe('Operation completed successfully')
    })
  })

  describe('errorResponse', () => {
    it('should create an error response with message', () => {
      const response = errorResponse('Something went wrong')

      expect(response).toEqual({
        success: false,
        message: 'Something went wrong',
        error: {},
      })
    })

    it('should include error code and details', () => {
      const response = errorResponse('Error', 'ERROR_CODE', { field: 'value' })

      expect(response.success).toBe(false)
      expect(response.error?.code).toBe('ERROR_CODE')
      expect(response.error?.details).toEqual({ field: 'value' })
    })
  })

  describe('handleApiError', () => {
    it('should handle Error instances', () => {
      const error = new Error('Test error')
      const response = handleApiError(error)

      expect(response.success).toBe(false)
      expect(response.message).toBe('Test error')
      expect(response.error?.code).toBe('INTERNAL_ERROR')
    })

    it('should handle unknown errors', () => {
      const response = handleApiError(null)

      expect(response.success).toBe(false)
      expect(response.message).toBe('An unexpected error occurred')
      expect(response.error?.code).toBe('UNKNOWN_ERROR')
    })

    it('should include stack trace in development', () => {
      process.env.NODE_ENV = 'development'
      const error = new Error('Test error')
      const response = handleApiError(error)

      expect(response.error?.details).toContain('Error: Test error')
    })
  })
})

