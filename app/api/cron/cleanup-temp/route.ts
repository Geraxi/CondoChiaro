import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { successResponse, errorResponse } from '@/lib/api-response'

/**
 * Daily Cron Job: Clean up temporary import files
 * Runs daily at 3 AM UTC
 * GET /api/cron/cleanup-temp
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      errorResponse('Unauthorized', 'UNAUTHORIZED'),
      { status: 401 }
    )
  }

  try {
    // Delete files older than 24 hours from temp imports bucket
    const twentyFourHoursAgo = new Date()
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

    const { data: files, error: listError } = await supabase.storage
      .from('migration-files')
      .list('temp', {
        limit: 1000,
      })

    if (listError) {
      throw listError
    }

    const filesToDelete = files?.filter(file => {
      const fileDate = new Date(file.created_at)
      return fileDate < twentyFourHoursAgo
    }) || []

    if (filesToDelete.length > 0) {
      const filePaths = filesToDelete.map(f => `temp/${f.name}`)
      const { error: deleteError } = await supabase.storage
        .from('migration-files')
        .remove(filePaths)

      if (deleteError) {
        throw deleteError
      }
    }

    return NextResponse.json(
      successResponse(
        { deleted: filesToDelete.length },
        'Temp cleanup completed'
      )
    )
  } catch (error) {
    console.error('Cleanup cron error:', error)
    return NextResponse.json(
      errorResponse('Cleanup failed', 'CRON_ERROR'),
      { status: 500 }
    )
  }
}







