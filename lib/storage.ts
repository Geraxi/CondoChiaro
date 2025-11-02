/**
 * Supabase Storage Utilities
 * Handles signed URLs with expiration
 */

import { supabase } from './supabase'

const SIGNED_URL_EXPIRATION_SECONDS = 3600 // 1 hour

/**
 * Get a signed URL for a file in Supabase Storage
 * URLs expire after 1 hour for security
 */
export async function getSignedUrl(
  bucket: string,
  filePath: string,
  expiresIn: number = SIGNED_URL_EXPIRATION_SECONDS
): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn)

    if (error) {
      console.error('Error creating signed URL:', error)
      return null
    }

    return data?.signedUrl || null
  } catch (error) {
    console.error('Error generating signed URL:', error)
    return null
  }
}

/**
 * Upload file to Supabase Storage with proper access control
 */
export async function uploadFile(
  bucket: string,
  filePath: string,
  file: File | Blob,
  options?: {
    cacheControl?: string
    contentType?: string
    upsert?: boolean
  }
) {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: options?.cacheControl || '3600',
        contentType: options?.contentType,
        upsert: options?.upsert || false,
      })

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error uploading file:', error)
    return { data: null, error }
  }
}

/**
 * Delete file from Supabase Storage
 */
export async function deleteFile(bucket: string, filePath: string) {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath])

    if (error) {
      throw error
    }

    return { error: null }
  } catch (error) {
    console.error('Error deleting file:', error)
    return { error }
  }
}

/**
 * Verify file access permissions
 * Ensures user can only access files from their own condominiums
 */
export async function verifyFileAccess(
  filePath: string,
  userId: string
): Promise<boolean> {
  try {
    // Extract condominium ID from file path if following convention:
    // bucket/{condominium_id}/...
    const pathParts = filePath.split('/')
    const condoIdIndex = pathParts.findIndex(part => part.length === 36) // UUID length

    if (condoIdIndex === -1) {
      return false
    }

    const condoId = pathParts[condoIdIndex]

    // Verify ownership
    const { data, error } = await supabase
      .from('condominiums')
      .select('admin_id')
      .eq('id', condoId)
      .eq('admin_id', userId)
      .single()

    return !error && !!data
  } catch (error) {
    console.error('Error verifying file access:', error)
    return false
  }
}

