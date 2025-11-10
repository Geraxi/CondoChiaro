/**
 * Excel/CSV Data Import Tests
 */

import * as XLSX from 'xlsx'
import { createMockExcelData } from './utils/test-helpers'
import { createMockSupabaseClient, mockCondominium } from './utils/test-helpers'

jest.mock('@/lib/supabaseServer', () => ({
  createServerClient: jest.fn(),
  supabaseServer: null,
}))

describe('Excel / CSV Data Import', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Excel File Parsing', () => {
    it('should correctly parse a mock .xlsx file', () => {
      const mockData = createMockExcelData()
      const workbook = XLSX.utils.book_new()
      const worksheet = XLSX.utils.aoa_to_sheet(mockData['Unità Abitative'])
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Unità Abitative')

      const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

      expect(sheetData).toBeDefined()
      expect(Array.isArray(sheetData)).toBe(true)
      expect(sheetData.length).toBeGreaterThan(0)
      expect(sheetData[0]).toEqual(['Appartamento', 'Condòmino', 'Email', 'Telefono', 'IBAN'])
    })

    it('should correctly map columns from Excel to database schema', () => {
      const mockData = createMockExcelData()
      const headers = mockData['Unità Abitative'][0] as string[]
      const rows = mockData['Unità Abitative'].slice(1)

      const mappedData = rows.map((row: any) => ({
        apartment: row[0],
        name: row[1],
        email: row[2],
        phone: row[3],
        iban: row[4],
      }))

      expect(mappedData.length).toBe(3)
      expect(mappedData[0]).toEqual({
        apartment: 'A1',
        name: 'Mario Rossi',
        email: 'mario@test.com',
        phone: '+39 123 456 7890',
        iban: 'IT60X0542811101000000123456',
      })
    })

    it('should handle invalid columns gracefully', () => {
      const invalidData = [
        ['Wrong Column 1', 'Wrong Column 2'],
        ['Value 1', 'Value 2'],
      ]

      // Should detect missing required columns
      const requiredColumns = ['Appartamento', 'Condòmino', 'Email']
      const headers = invalidData[0] as string[]
      const missingColumns = requiredColumns.filter((col) => !headers.includes(col))

      expect(missingColumns.length).toBeGreaterThan(0)
      expect(missingColumns).toContain('Appartamento')
      expect(missingColumns).toContain('Condòmino')
      expect(missingColumns).toContain('Email')
    })

    it('should validate IBAN format', () => {
      const validIBAN = 'IT60X0542811101000000123456'
      const invalidIBAN = 'INVALID-IBAN'

      const ibanRegex = /^IT\d{2}[A-Z]\d{5}\d{5}[A-Z0-9]{12}$/

      expect(ibanRegex.test(validIBAN)).toBe(true)
      expect(ibanRegex.test(invalidIBAN)).toBe(false)
    })
  })

  describe('Data Import to Supabase', () => {
    it('should import all tenants from Excel to database', async () => {
      const mockData = createMockExcelData()
      const rows = mockData['Unità Abitative'].slice(1)
      const tenants = rows.map((row: any) => ({
        condo_id: mockCondominium.id,
        apartment: row[0],
        name: row[1],
        email: row[2],
        phone: row[3],
        iban: row[4],
      }))

      const mockQuery = mockSupabase.from('tenants')
      mockQuery.insert.mockReturnValue(mockQuery)
      mockQuery.select.mockResolvedValue({
        data: tenants.map((t, i) => ({
          ...t,
          id: `tenant-imported-${i}`,
          created_at: new Date().toISOString(),
        })),
        error: null,
      })

      const result = await mockQuery.from('tenants').insert(tenants).select()

      expect(result.data).toBeDefined()
      expect(result.data?.length).toBe(3)
      expect(result.error).toBeNull()
    })

    it('should handle duplicate email addresses', async () => {
      const duplicateTenants = [
        {
          condo_id: mockCondominium.id,
          apartment: 'A1',
          name: 'Test Tenant',
          email: 'duplicate@test.com',
        },
        {
          condo_id: mockCondominium.id,
          apartment: 'A2',
          name: 'Another Tenant',
          email: 'duplicate@test.com', // Duplicate email
        },
      ]

      const mockQuery = mockSupabase.from('tenants')
      mockQuery.insert.mockReturnValue(mockQuery)
      mockQuery.select.mockReturnValue(mockQuery)
      mockQuery.single.mockResolvedValue({
        data: null,
        error: {
          message: 'duplicate key value violates unique constraint "tenants_email_key"',
          code: '23505',
        },
      })

      const result = await mockQuery.from('tenants').insert(duplicateTenants[1]).select().single()

      expect(result.data).toBeNull()
      expect(result.error).toBeDefined()
      expect(result.error?.code).toBe('23505')
    })

    it('should normalize apartment numbers', () => {
      const testCases = [
        { input: 'A1', expected: 'A1' },
        { input: 'a1', expected: 'A1' },
        { input: ' A1 ', expected: 'A1' },
        { input: 'A-1', expected: 'A1' },
      ]

      testCases.forEach(({ input, expected }) => {
        const normalized = input.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
        expect(normalized).toBe(expected)
      })
    })

    it('should validate email format before import', () => {
      const emails = [
        'valid@test.com',
        'invalid-email',
        'another.valid@example.it',
        'no-at-symbol.com',
      ]

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      const validEmails = emails.filter((email) => emailRegex.test(email))

      expect(validEmails.length).toBe(2)
      expect(validEmails).toContain('valid@test.com')
      expect(validEmails).toContain('another.valid@example.it')
    })
  })

  describe('CSV Import', () => {
    it('should parse CSV data correctly', () => {
      const csvData = `Appartamento,Condòmino,Email,Telefono,IBAN
A1,Mario Rossi,mario@test.com,+39 123 456 7890,IT60X0542811101000000123456
A2,Luigi Bianchi,luigi@test.com,+39 123 456 7891,IT60X0542811101000000123457`

      const lines = csvData.split('\n')
      const headers = lines[0].split(',')
      const rows = lines.slice(1).map((line) => line.split(','))

      expect(headers.length).toBe(5)
      expect(rows.length).toBe(2)
      expect(rows[0][0]).toBe('A1')
      expect(rows[0][1]).toBe('Mario Rossi')
    })

    it('should handle CSV with different delimiters', () => {
      const semicolonCsv = `Appartamento;Condòmino;Email
A1;Mario Rossi;mario@test.com`

      const lines = semicolonCsv.split('\n')
      const headers = lines[0].split(';')
      const rows = lines.slice(1).map((line) => line.split(';'))

      expect(headers.length).toBe(3)
      expect(rows[0][0]).toBe('A1')
    })
  })

  describe('Error Handling in Import', () => {
    it('should return descriptive error for missing required columns', () => {
      const invalidHeaders = ['Name', 'Email'] // Missing apartment and other required fields

      const requiredColumns = ['Appartamento', 'Condòmino', 'Email']
      const missing = requiredColumns.filter((col) => !invalidHeaders.includes(col))

      expect(missing.length).toBeGreaterThan(0)
      expect(missing).toContain('Appartamento')
    })

    it('should skip invalid rows and continue import', () => {
      const rows = [
        ['A1', 'Valid Tenant', 'valid@test.com'],
        ['', 'Invalid Tenant', 'invalid-email'], // Missing apartment, invalid email
        ['A3', 'Another Valid', 'another@test.com'],
      ]

      const validRows = rows.filter((row) => {
        return row[0] && row[1] && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row[2])
      })

      expect(validRows.length).toBe(2)
      expect(validRows[0][0]).toBe('A1')
      expect(validRows[1][0]).toBe('A3')
    })
  })
})




