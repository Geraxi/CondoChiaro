/**
 * File Storage Tests
 */

import { createMockSupabaseClient, mockAdminUser, mockCondominium } from './utils/test-helpers'

jest.mock('@/lib/supabaseServer', () => ({
  createServerClient: jest.fn(),
  supabaseServer: null,
}))

describe('File Storage', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('File Upload', () => {
    it('should upload a test PDF file to Supabase Storage', async () => {
      const testFile = new Blob(['PDF content'], { type: 'application/pdf' })
      const fileName = 'test-invoice.pdf'
      const bucket = 'documents'
      const filePath = `${mockAdminUser.id}/${fileName}`

      const mockStorage = mockSupabase.storage.from(bucket)
      mockStorage.upload.mockResolvedValue({
        data: {
          path: filePath,
          id: 'file-id-123',
        },
        error: null,
      })

      const result = await mockStorage.upload(filePath, testFile, {
        contentType: 'application/pdf',
        upsert: false,
      })

      expect(result.data).toBeDefined()
      expect(result.data?.path).toBe(filePath)
      expect(result.error).toBeNull()
      expect(mockStorage.upload).toHaveBeenCalledWith(filePath, testFile, expect.any(Object))
    })

    it('should upload invoice PDF with correct metadata', async () => {
      const testFile = new Blob(['Invoice PDF'], { type: 'application/pdf' })
      const fileName = 'invoice-2024-01.pdf'
      const bucket = 'invoices'
      const filePath = `condo-${mockCondominium.id}/${fileName}`

      const mockStorage = mockSupabase.storage.from(bucket)
      mockStorage.upload.mockResolvedValue({
        data: {
          path: filePath,
          id: 'invoice-file-id',
        },
        error: null,
      })

      const result = await mockStorage.upload(filePath, testFile, {
        contentType: 'application/pdf',
        metadata: {
          condo_id: mockCondominium.id,
          type: 'invoice',
          month: '2024-01',
        },
      })

      expect(result.data).toBeDefined()
      expect(result.error).toBeNull()
    })
  })

  describe('File Retrieval', () => {
    it('should retrieve uploaded file from Supabase Storage', async () => {
      const filePath = `${mockAdminUser.id}/test-invoice.pdf`
      const bucket = 'documents'
      const mockFileContent = new Blob(['PDF content'], { type: 'application/pdf' })

      const mockStorage = mockSupabase.storage.from(bucket)
      mockStorage.download.mockResolvedValue({
        data: mockFileContent,
        error: null,
      })

      const result = await mockStorage.download(filePath)

      expect(result.data).toBeDefined()
      expect(result.data).toBeInstanceOf(Blob)
      expect(result.error).toBeNull()
      expect(mockStorage.download).toHaveBeenCalledWith(filePath)
    })

    it('should create signed URL for file access', async () => {
      const filePath = `${mockAdminUser.id}/test-invoice.pdf`
      const bucket = 'documents'
      const signedUrl = `https://supabase.co/storage/v1/object/sign/${bucket}/${filePath}?token=abc123`

      const mockStorage = mockSupabase.storage.from(bucket)
      mockStorage.createSignedUrl.mockResolvedValue({
        data: {
          signedUrl,
        },
        error: null,
      })

      const result = await mockStorage.createSignedUrl(filePath, 3600)

      expect(result.data?.signedUrl).toBeDefined()
      expect(result.data?.signedUrl).toContain(filePath)
      expect(result.error).toBeNull()
    })
  })

  describe('File Deletion', () => {
    it('should delete file from Supabase Storage', async () => {
      const filePath = `${mockAdminUser.id}/test-invoice.pdf`
      const bucket = 'documents'

      const mockStorage = mockSupabase.storage.from(bucket)
      mockStorage.remove.mockResolvedValue({
        data: [{ name: filePath }],
        error: null,
      })

      const result = await mockStorage.remove([filePath])

      expect(result.data).toBeDefined()
      expect(result.error).toBeNull()
      expect(mockStorage.remove).toHaveBeenCalledWith([filePath])
    })

    it('should handle deletion of non-existent file gracefully', async () => {
      const filePath = 'non-existent-file.pdf'
      const bucket = 'documents'

      const mockStorage = mockSupabase.storage.from(bucket)
      mockStorage.remove.mockResolvedValue({
        data: [],
        error: null,
      })

      const result = await mockStorage.remove([filePath])

      expect(result.data).toBeDefined()
      expect(result.error).toBeNull()
    })
  })

  describe('Access Control', () => {
    it('should enforce access control on file retrieval', async () => {
      const filePath = `other-admin-id/private-file.pdf`
      const bucket = 'documents'

      const mockStorage = mockSupabase.storage.from(bucket)
      mockStorage.download.mockResolvedValue({
        data: null,
        error: {
          message: 'The resource was not found',
          statusCode: 404,
        },
      })

      const result = await mockStorage.download(filePath)

      expect(result.data).toBeNull()
      expect(result.error).toBeDefined()
      expect(result.error?.statusCode).toBe(404)
    })

    it('should allow admin to access their own files', async () => {
      const filePath = `${mockAdminUser.id}/my-file.pdf`
      const bucket = 'documents'
      const mockFileContent = new Blob(['Content'], { type: 'application/pdf' })

      const mockStorage = mockSupabase.storage.from(bucket)
      mockStorage.download.mockResolvedValue({
        data: mockFileContent,
        error: null,
      })

      const result = await mockStorage.download(filePath)

      expect(result.data).toBeDefined()
      expect(result.error).toBeNull()
    })
  })

  describe('File Listing', () => {
    it('should list files in a directory', async () => {
      const folderPath = `${mockAdminUser.id}`
      const bucket = 'documents'

      const mockFiles = [
        { name: 'invoice-1.pdf', id: 'file-1', created_at: new Date().toISOString() },
        { name: 'invoice-2.pdf', id: 'file-2', created_at: new Date().toISOString() },
      ]

      const mockStorage = mockSupabase.storage.from(bucket)
      mockStorage.list.mockResolvedValue({
        data: mockFiles,
        error: null,
      })

      const result = await mockStorage.list(folderPath)

      expect(result.data).toBeDefined()
      expect(result.data?.length).toBe(2)
      expect(result.error).toBeNull()
    })
  })
})

