import { NextResponse } from 'next/server'

/**
 * Simple test endpoint to verify API routes work
 * GET /api/test
 */
export async function GET() {
  return NextResponse.json({ 
    success: true, 
    message: 'API routes are working!',
    timestamp: new Date().toISOString()
  })
}





