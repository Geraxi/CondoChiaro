/**
 * Helper functions for Next.js API routes
 * Wraps ApiResponse in NextResponse for proper typing
 */

import { NextResponse } from 'next/server'
import { errorResponse, successResponse, ApiResponse } from './api-response'

export function apiErrorResponse(message: string, code?: string, status: number = 500): NextResponse<ApiResponse> {
  return NextResponse.json(errorResponse(message, code), { status })
}

export function apiSuccessResponse<T>(data: T, message: string = 'Success'): NextResponse<ApiResponse<T>> {
  return NextResponse.json(successResponse(data, message))
}

