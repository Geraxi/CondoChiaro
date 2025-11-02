/**
 * Standardized API Response Format
 * All API endpoints should use this format for consistency
 */

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: {
    code?: string
    details?: any
  }
}

/**
 * Create a success response
 */
export function successResponse<T>(
  data: T,
  message: string = 'Operation completed successfully'
): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
  }
}

/**
 * Create an error response
 */
export function errorResponse(
  message: string,
  code?: string,
  details?: any
): ApiResponse {
  return {
    success: false,
    message,
    error: {
      code,
      details,
    },
  }
}

/**
 * Handle API errors consistently
 */
export function handleApiError(error: unknown): ApiResponse {
  if (error instanceof Error) {
    return errorResponse(
      error.message || 'An unexpected error occurred',
      'INTERNAL_ERROR',
      process.env.NODE_ENV === 'development' ? error.stack : undefined
    )
  }

  return errorResponse(
    'An unexpected error occurred',
    'UNKNOWN_ERROR'
  )
}

