import { test, expect } from '@playwright/test'

/**
 * Critical E2E Test: Admin Workflow
 * Login → Add condominium → Upload document → Invite tenant → Tenant login → View document
 */
test.describe('Critical Admin Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto('/')
  })

  test('complete admin workflow: create condo, upload doc, invite tenant', async ({ page }) => {
    // Step 1: Login as admin
    await page.click('text=Accedi')
    await page.fill('input[type="email"]', 'admin@test.com')
    await page.fill('input[type="password"]', 'testpassword123')
    await page.click('button[type="submit"]')

    // Wait for dashboard
    await expect(page.locator('text=Dashboard Amministratore')).toBeVisible()

    // Step 2: Add condominium
    await page.click('text=+ Aggiungi Condominio')
    await page.fill('input[name="name"]', 'Test Condominium')
    await page.fill('textarea[name="address"]', 'Via Test 123, Milano')
    await page.click('button:has-text("Salva")')

    // Verify condo appears
    await expect(page.locator('text=Test Condominium')).toBeVisible()

    // Step 3: Open condominium and upload document
    await page.click('text=Apri Condominio')
    await page.click('text=Documenti')
    await page.click('text=+ Aggiungi Documento')

    // Upload file (mock - in real test would use actual file)
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles({
      name: 'test-document.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('mock pdf content'),
    })

    await page.fill('input[name="name"]', 'Test Document')
    await page.selectOption('select[name="category"]', 'verbale')
    await page.click('button:has-text("Carica")')

    // Verify document uploaded
    await expect(page.locator('text=Test Document')).toBeVisible()

    // Step 4: Invite tenant
    await page.click('text=Inquilini')
    await page.click('text=+ Aggiungi Inquilino')
    await page.fill('input[name="name"]', 'Mario')
    await page.fill('input[name="surname"]', 'Rossi')
    await page.fill('input[name="email"]', 'mario.rossi@test.com')
    await page.click('button:has-text("Salva")')

    // Verify tenant added
    await expect(page.locator('text=Mario Rossi')).toBeVisible()
  })
})

/**
 * Security Test: Verify data isolation
 */
test.describe('Data Isolation Security', () => {
  test('admin cannot access other admin data', async ({ page, context }) => {
    // Login as Admin 1
    await page.goto('/login')
    await page.fill('input[type="email"]', 'admin1@test.com')
    await page.fill('input[type="password"]', 'password1')
    await page.click('button[type="submit"]')

    // Get admin1's condo ID
    const condoId = await page.locator('[data-condo-id]').first().getAttribute('data-condo-id')

    // Login as Admin 2 in new context
    const newContext = await context.browser()?.newContext()
    const page2 = await newContext?.newPage()
    
    if (page2) {
      await page2.goto('/login')
      await page2.fill('input[type="email"]', 'admin2@test.com')
      await page2.fill('input[type="password"]', 'password2')
      await page2.click('button[type="submit"]')

      // Try to access admin1's condo (should fail or not be visible)
      await page2.goto(`/admin/condomini/${condoId}`)
      
      // Should either redirect or show not found
      await expect(page2.locator('text=Non autorizzato') || page2.locator('text=404')).toBeVisible()
      
      await page2.close()
      await newContext?.close()
    }
  })
})

