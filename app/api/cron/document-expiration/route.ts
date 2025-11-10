import { NextRequest } from 'next/server'
import { apiErrorResponse, apiSuccessResponse } from '@/lib/api-helpers'
import { supabaseServer } from '@/lib/supabaseServer'

export const dynamic = 'force-dynamic'

// This endpoint should be called by a cron job daily
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = request.headers.get('x-cron-secret')
    
    if (cronSecret !== process.env.CRON_SECRET && !authHeader) {
      return apiErrorResponse('Unauthorized', 'AUTH_ERROR', 401)
    }

    if (!supabaseServer) {
      return apiErrorResponse('Database not configured', 'CONFIG_ERROR', 500)
    }

    // Find documents expiring within 30 days
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data: expiringDocuments, error: docsError } = await supabaseServer
      .from('documents')
      .select('*, condominiums(admin_id, admins(id, email, full_name))')
      .not('expiry_date', 'is', null)
      .lte('expiry_date', thirtyDaysFromNow.toISOString().split('T')[0])
      .gte('expiry_date', today.toISOString().split('T')[0])
      .eq('reminder_sent', false)

    if (docsError) {
      console.error('Error fetching expiring documents:', docsError)
      return apiErrorResponse('Failed to fetch documents', 'DB_ERROR', 500)
    }

    const notified = []

    if (expiringDocuments && expiringDocuments.length > 0) {
      for (const doc of expiringDocuments) {
        const adminId = (doc.condominiums as any)?.admin_id
        if (adminId) {
          const daysUntilExpiry = Math.ceil(
            (new Date(doc.expiry_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          )

          // Create notification
          await supabaseServer.from('notifications').insert({
            user_id: adminId,
            type: 'document_expiry',
            title: 'Documento in Scadenza',
            message: `Il documento "${doc.title}" scade tra ${daysUntilExpiry} giorno${daysUntilExpiry !== 1 ? 'i' : ''}`,
            link: `/admin/documents?doc=${doc.id}`,
            metadata: {
              document_id: doc.id,
              expiry_date: doc.expiry_date,
              days_until_expiry: daysUntilExpiry,
            },
          })

          // Mark reminder as sent
          await supabaseServer
            .from('documents')
            .update({ reminder_sent: true })
            .eq('id', doc.id)

          notified.push({ document_id: doc.id, days_until_expiry: daysUntilExpiry })
        }
      }
    }

    return apiSuccessResponse(
      {
        notified: notified.length,
        documents: notified,
      },
      `Notificati ${notified.length} documenti in scadenza`
    )
  } catch (error: any) {
    console.error('Document expiration check error:', error)
    return apiErrorResponse(error.message || 'Failed to check document expiration', 'SERVER_ERROR', 500)
  }
}



