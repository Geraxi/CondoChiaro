import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { successResponse, errorResponse } from '@/lib/api-response'

/**
 * Upload a document to Supabase Storage
 * POST /api/documents/upload
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const condominiumId = formData.get('condominium_id') as string
    const category = formData.get('category') as string
    const description = formData.get('description') as string

    // Validate required fields
    if (!file || !condominiumId || !category) {
      return NextResponse.json(
        errorResponse('File, condominium_id, and category are required', 'VALIDATION_ERROR'),
        { status: 400 }
      )
    }

    // Get the user from the session
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        errorResponse('Unauthorized', 'UNAUTHORIZED'),
        { status: 401 }
      )
    }

    // Check if user is admin
    const userRole = user.user_metadata?.role
    if (userRole !== 'admin') {
      return NextResponse.json(
        errorResponse('Forbidden: Admin access required', 'FORBIDDEN'),
        { status: 403 }
      )
    }

    // Verify that the condominium belongs to this admin
    const { data: condominium, error: condoError } = await supabase
      .from('condominiums')
      .select('id')
      .eq('id', condominium_id)
      .eq('admin_id', user.id)
      .single()

    if (condoError || !condominium) {
      return NextResponse.json(
        errorResponse('Condominium not found or access denied', 'NOT_FOUND'),
        { status: 404 }
      )
    }

    // Validate file size (50MB limit for PDFs, 10MB for others)
    const maxSize = file.type === 'application/pdf' ? 50 * 1024 * 1024 : 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        errorResponse(`File size too large. Maximum size is ${maxSize / (1024 * 1024)}MB`, 'FILE_TOO_LARGE'),
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif',
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        errorResponse('Invalid file type', 'INVALID_FILE_TYPE'),
        { status: 400 }
      )
    }

    // Generate unique file name
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `documents/${condominiumId}/${fileName}`

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('condominium-docs')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Error uploading file:', uploadError)
      return NextResponse.json(
        errorResponse('Failed to upload file', 'UPLOAD_ERROR', uploadError),
        { status: 500 }
      )
    }

    // Get public URL for the file
    const { data: { publicUrl } } = supabase.storage
      .from('condominium-docs')
      .getPublicUrl(filePath)

    // Create document record in database
    const { data: document, error: dbError } = await supabase
      .from('documents')
      .insert({
        condominium_id: condominiumId,
        name: file.name,
        file_url: publicUrl,
        file_size: file.size,
        file_type: file.type,
        category: category.trim(),
        description: description?.trim() || null,
        created_by: user.id,
      })
      .select()
      .single()

    if (dbError) {
      console.error('Error creating document record:', dbError)

      // Try to clean up uploaded file
      await supabase.storage
        .from('condominium-docs')
        .remove([filePath])

      return NextResponse.json(
        errorResponse('Failed to create document record', 'DATABASE_ERROR', dbError),
        { status: 500 }
      )
    }

    // TODO: Trigger AI summarization if it's a PDF and AI features are enabled
    if (file.type === 'application/pdf' && process.env.NEXT_PUBLIC_AI_FEATURES_ENABLED === 'true') {
      // This would trigger the AI summarization edge function
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/documents/summarize`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await supabase.auth.getSession().then(r => r.data.session?.access_token)}`,
          },
          body: JSON.stringify({
            documentId: document.id,
            fileUrl: publicUrl,
          }),
        })
      } catch (aiError) {
        console.error('Failed to trigger AI summarization:', aiError)
        // Don't fail the upload if AI summarization fails
      }
    }

    return NextResponse.json(
      successResponse(document, 'Document uploaded successfully'),
      { status: 201 }
    )

  } catch (error) {
    console.error('Unexpected error in POST /api/documents/upload:', error)
    return NextResponse.json(
      errorResponse('Internal server error', 'INTERNAL_ERROR', error),
      { status: 500 }
    )
  }
}