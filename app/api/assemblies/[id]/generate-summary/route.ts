import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabaseServer'
import { apiErrorResponse, apiSuccessResponse } from '@/lib/api-helpers'
import OpenAI from 'openai'

export const dynamic = 'force-dynamic'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return apiErrorResponse('Unauthorized', 'AUTH_ERROR', 401)
    }

    const token = authHeader.replace('Bearer ', '')
    const supabase = createServerClient(token)

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return apiErrorResponse('Unauthorized', 'AUTH_ERROR', 401)
    }

    // Verify user is admin
    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('id')
      .eq('id', user.id)
      .single()

    if (adminError || !admin) {
      return apiErrorResponse('Admin access required', 'AUTH_ERROR', 403)
    }

    // Get assembly data (assuming assemblies table exists or we use a generic structure)
    const { data: assembly, error: assemblyError } = await supabase
      .from('assemblies')
      .select('*, condominiums(id, name)')
      .eq('id', params.id)
      .single()

    if (assemblyError || !assembly) {
      // If assemblies table doesn't exist, try to get from documents or create a generic structure
      const { data: document } = await supabase
        .from('documents')
        .select('*')
        .eq('id', params.id)
        .eq('type', 'verbale')
        .single()

      if (!document) {
        return apiErrorResponse('Assembly not found', 'NOT_FOUND', 404)
      }

      // Use document as assembly data
      const assemblyData = {
        id: document.id,
        title: document.title || 'Assemblea Condominiale',
        content: document.content || document.description || '',
        condo_id: document.condominium_id,
        meeting_date: document.created_at,
      }

      // Generate AI summary
      const prompt = `Genera un verbale sintetico in italiano per un'assemblea condominiale basato su queste informazioni:

Titolo: ${assemblyData.title}
Contenuto: ${assemblyData.content || 'Nessun contenuto disponibile'}

Il verbale deve includere:
1. Argomenti chiave discussi
2. Votazioni effettuate (se presenti)
3. Decisioni prese
4. Prossimi passi (se presenti)

Formatta la risposta come JSON con questa struttura:
{
  "summary": "Riassunto completo dell'assemblea",
  "key_topics": ["argomento1", "argomento2"],
  "votes": [{"topic": "argomento", "result": "approvato/rifiutato", "votes_for": 0, "votes_against": 0}],
  "decisions": ["decisione1", "decisione2"]
}`

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Sei un assistente specializzato nella creazione di verbali sintetici per assemblee condominiali. Rispondi sempre in italiano e in formato JSON valido.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      })

      const aiResponse = JSON.parse(completion.choices[0].message.content || '{}')

      // Create assembly summary
      const { data: summary, error: summaryError } = await supabase
        .from('assembly_summaries')
        .insert({
          assembly_id: assemblyData.id,
          admin_id: user.id,
          summary_text: aiResponse.summary || '',
          approved: false,
        })
        .select()
        .single()

      if (summaryError) {
        console.error('Error creating summary:', summaryError)
        return apiErrorResponse('Failed to create summary', 'DB_ERROR', 500)
      }

      return apiSuccessResponse(summary, 'Verbale sintetico generato con successo')
    }

    // If assembly exists, use it
    const prompt = `Genera un verbale sintetico in italiano per un'assemblea condominiale basato su queste informazioni:

Titolo: ${assembly.title || 'Assemblea Condominiale'}
Contenuto: ${assembly.notes || assembly.description || 'Nessun contenuto disponibile'}
Data: ${assembly.meeting_date || assembly.created_at}

Il verbale deve includere:
1. Argomenti chiave discussi
2. Votazioni effettuate (se presenti)
3. Decisioni prese
4. Prossimi passi (se presenti)

Formatta la risposta come JSON con questa struttura:
{
  "summary": "Riassunto completo dell'assemblea",
  "key_topics": ["argomento1", "argomento2"],
  "votes": [{"topic": "argomento", "result": "approvato/rifiutato", "votes_for": 0, "votes_against": 0}],
  "decisions": ["decisione1", "decisione2"]
}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Sei un assistente specializzato nella creazione di verbali sintetici per assemblee condominiali. Rispondi sempre in italiano e in formato JSON valido.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    })

    const aiResponse = JSON.parse(completion.choices[0].message.content || '{}')

    // Create assembly summary
    const { data: summary, error: summaryError } = await supabase
      .from('assembly_summaries')
      .insert({
        assembly_id: params.id,
        admin_id: user.id,
        summary_text: aiResponse.summary || '',
        approved: false,
      })
      .select()
      .single()

    if (summaryError) {
      console.error('Error creating summary:', summaryError)
      return apiErrorResponse('Failed to create summary', 'DB_ERROR', 500)
    }

    return apiSuccessResponse(summary, 'Verbale sintetico generato con successo')
  } catch (error: any) {
    console.error('Generate summary error:', error)
    return apiErrorResponse(error.message || 'Failed to generate summary', 'SERVER_ERROR', 500)
  }
}

