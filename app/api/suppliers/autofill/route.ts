import { NextRequest, NextResponse } from 'next/server'
import { autofillFromUrl } from '@/lib/supplierAutofill'
import { errorResponse, successResponse } from '@/lib/api-response'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const autofillSchema = z.object({
  url: z.string().url(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = autofillSchema.parse(body)

    const data = await autofillFromUrl(url)

    return NextResponse.json(successResponse(data, 'Autofill data retrieved'))
  } catch (error: any) {
    console.error('Autofill error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(errorResponse('Invalid URL', 'VALIDATION_ERROR'), { status: 400 })
    }
    return NextResponse.json(errorResponse(error.message || 'Failed to fetch website data', 'AUTOFILL_ERROR'), { status: 500 })
  }
}

