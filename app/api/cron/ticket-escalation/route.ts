import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabaseServer'
import { apiErrorResponse, apiSuccessResponse } from '@/lib/api-helpers'
import { supabaseServer } from '@/lib/supabaseServer'

export const dynamic = 'force-dynamic'

// This endpoint should be called by a cron job daily
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    const cronSecret = request.headers.get('x-cron-secret')
    
    if (cronSecret !== process.env.CRON_SECRET && !authHeader) {
      return apiErrorResponse('Unauthorized', 'AUTH_ERROR', 401)
    }

    if (!supabaseServer) {
      return apiErrorResponse('Database not configured', 'CONFIG_ERROR', 500)
    }

    // Find tickets/jobs that are open for more than 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    // Check jobs table - find open tickets older than 7 days
    const { data: jobsToEscalate, error: jobsError } = await supabaseServer
      .from('jobs')
      .select('*, admins(id, email, full_name), suppliers(id, name, email)')
      .eq('status', 'open')
      .eq('escalated', false)
      .lt('created_at', sevenDaysAgo.toISOString())

    if (jobsError) {
      console.error('Error fetching jobs to escalate:', jobsError)
    }

    // Check interventi table
    const { data: interventiToEscalate, error: interventiError } = await supabaseServer
      .from('interventi')
      .select('*, condominiums(admin_id, admins(id, email, full_name))')
      .eq('status', 'open')
      .eq('escalated', false)
      .lt('created_at', sevenDaysAgo.toISOString())

    if (interventiError) {
      console.error('Error fetching interventi to escalate:', interventiError)
    }

    const escalated = []

    // Escalate jobs
    if (jobsToEscalate && jobsToEscalate.length > 0) {
      for (const job of jobsToEscalate) {
        // Update escalation status
        await supabaseServer
          .from('jobs')
          .update({
            escalated: true,
            escalation_date: new Date().toISOString(),
            reminder_sent: false,
          })
          .eq('id', job.id)

        // Create notifications
        if (job.admins) {
          await supabaseServer.from('notifications').insert({
            user_id: (job.admins as any).id,
            type: 'ticket_escalation',
            title: 'Ticket in Escalazione',
            message: `Il ticket "${job.title}" è aperto da più di 7 giorni e richiede attenzione`,
            link: `/admin/maintenance?job=${job.id}`,
            metadata: {
              job_id: job.id,
              days_open: Math.floor((Date.now() - new Date(job.created_at).getTime()) / (1000 * 60 * 60 * 24)),
            },
          })
        }

        if (job.suppliers) {
          // Find supplier users
          const { data: supplierUsers } = await supabaseServer
            .from('supplier_users')
            .select('user_id')
            .eq('supplier_id', (job.suppliers as any).id)
            .limit(1)

          if (supplierUsers && supplierUsers.length > 0) {
            await supabaseServer.from('notifications').insert({
              user_id: supplierUsers[0].user_id,
              type: 'ticket_escalation',
              title: 'Ticket in Escalazione',
              message: `Il ticket "${job.title}" è aperto da più di 7 giorni`,
              link: `/supplier/workorders?job=${job.id}`,
              metadata: {
                job_id: job.id,
                days_open: Math.floor((Date.now() - new Date(job.created_at).getTime()) / (1000 * 60 * 60 * 24)),
              },
            })
          }
        }

        escalated.push({ type: 'job', id: job.id })
      }
    }

    // Escalate interventi
    if (interventiToEscalate && interventiToEscalate.length > 0) {
      for (const intervento of interventiToEscalate) {
        // Update escalation status
        await supabaseServer
          .from('interventi')
          .update({
            escalated: true,
            escalation_date: new Date().toISOString(),
            reminder_sent: false,
          })
          .eq('id', intervento.id)

        // Create notifications
        const adminId = (intervento.condominiums as any)?.admin_id
        if (adminId) {
          await supabaseServer.from('notifications').insert({
            user_id: adminId,
            type: 'ticket_escalation',
            title: 'Intervento in Escalazione',
            message: `L'intervento "${intervento.title}" è aperto da più di 7 giorni e richiede attenzione`,
            link: `/admin/maintenance?intervento=${intervento.id}`,
            metadata: {
              intervento_id: intervento.id,
              days_open: Math.floor((Date.now() - new Date(intervento.created_at).getTime()) / (1000 * 60 * 60 * 24)),
            },
          })
        }

        escalated.push({ type: 'intervento', id: intervento.id })
      }
    }

    return apiSuccessResponse(
      {
        escalated: escalated.length,
        jobs: escalated.filter((e) => e.type === 'job').length,
        interventi: escalated.filter((e) => e.type === 'intervento').length,
      },
      `Escalati ${escalated.length} ticket`
    )
  } catch (error: any) {
    console.error('Ticket escalation error:', error)
    return apiErrorResponse(error.message || 'Failed to escalate tickets', 'SERVER_ERROR', 500)
  }
}

