/**
 * Supplier autofill utilities
 * Fetches and parses website data for supplier onboarding
 */

interface AutofillData {
  name: string | null
  phone: string | null
  email: string | null
  address: string | null
  logo: string | null
  categories: string[]
}

/**
 * Fetch and parse website for supplier data
 */
export async function autofillFromUrl(url: string): Promise<AutofillData> {
  try {
    // Normalize URL
    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`
    const urlObj = new URL(normalizedUrl)

    // Fetch HTML
    const response = await fetch(normalizedUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; CondoChiaroBot/1.0; +https://condochiaro.com)',
      },
      signal: AbortSignal.timeout(10000), // 10s timeout
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const html = await response.text()

    // Parse OpenGraph and Schema.org data
    const data = parseWebsiteData(html, urlObj)

    return data
  } catch (error) {
    console.error('Autofill error:', error)
    return {
      name: null,
      phone: null,
      email: null,
      address: null,
      logo: null,
      categories: [],
    }
  }
}

/**
 * Parse HTML for structured data
 */
function parseWebsiteData(html: string, baseUrl: URL): AutofillData {
  const data: AutofillData = {
    name: null,
    phone: null,
    email: null,
    address: null,
    logo: null,
    categories: [],
  }

  // Extract OpenGraph tags
  const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i)
  const ogNameMatch = html.match(/<meta\s+property=["']og:site_name["']\s+content=["']([^"']+)["']/i)
  const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i)

  // Extract Schema.org JSON-LD
  const jsonLdMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)

  if (jsonLdMatches) {
    for (const match of jsonLdMatches) {
      try {
        const jsonStr = match.replace(/<script[^>]*>|<\/script>/gi, '').trim()
        if (!jsonStr) continue
        
        let json: any
        try {
          json = JSON.parse(jsonStr)
        } catch (parseError) {
          // Skip invalid JSON
          continue
        }

        if (!json || typeof json !== 'object') continue

        if (json['@type'] === 'LocalBusiness' || json['@type'] === 'Organization') {
          if (json.name && !data.name) data.name = json.name
          if (json.telephone && !data.phone) data.phone = json.telephone
          if (json.email && !data.email) data.email = json.email
          if (json.address) {
            const addr = typeof json.address === 'string' ? json.address : json.address?.streetAddress
            if (addr && !data.address) data.address = addr
          }
          if (json.logo) {
            const logoUrl = typeof json.logo === 'string' ? json.logo : json.logo?.url
            if (logoUrl) {
              try {
                data.logo = new URL(logoUrl, baseUrl).toString()
              } catch {
                // Skip invalid URL
              }
            }
          }
        }
      } catch {
        // Skip invalid JSON
      }
    }
  }

  // Fallback to meta tags
  if (!data.name) {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    data.name = ogTitleMatch?.[1] || ogNameMatch?.[1] || titleMatch?.[1] || null
  }

  if (!data.logo && ogImageMatch?.[1]) {
    data.logo = new URL(ogImageMatch[1], baseUrl).toString()
  }

  // Extract phone from various formats
  if (!data.phone) {
    const phoneMatches = [
      html.match(/tel:([+\d\s\-()]+)/i),
      html.match(/(\+39\s?)?[\d\s\-()]{9,12}/g),
    ]
    const phone = phoneMatches.find((m) => m)?.[1] || phoneMatches.find((m) => m)?.[0]
    if (phone) {
      data.phone = phone.replace(/\s/g, '').replace(/[()]/g, '')
    }
  }

  // Extract email
  if (!data.email) {
    const emailMatch = html.match(/mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i)
    if (emailMatch) {
      data.email = emailMatch[1]
    }
  }

  // Infer categories from content
  const content = html.toLowerCase()
  const categoryKeywords: Record<string, string[]> = {
    idraulico: ['idraulico', 'plumber', 'tubature', 'acqua'],
    elettricista: ['elettricista', 'electrician', 'elettrico', 'impianto elettrico'],
    manutenzione: ['manutenzione', 'maintenance', 'riparazione', 'repair'],
    pulizie: ['pulizie', 'cleaning', 'pulizia', 'sanificazione'],
    giardiniere: ['giardiniere', 'gardener', 'giardino', 'verde'],
  }

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((kw) => content.includes(kw))) {
      if (!data.categories.includes(category)) {
        data.categories.push(category)
      }
    }
  }

  return data
}

/**
 * Validate Italian VAT number format
 */
export function validateVAT(vat: string): { valid: boolean; formatted?: string } {
  // Remove spaces and convert to uppercase
  const cleaned = vat.replace(/\s/g, '').toUpperCase()

  // Italian VAT format: IT + 11 digits
  const itVatRegex = /^IT\d{11}$/

  if (!itVatRegex.test(cleaned)) {
    return { valid: false }
  }

  // Basic checksum validation (simplified)
  const digits = cleaned.slice(2).split('').map(Number)
  let sum = 0

  for (let i = 0; i < 10; i++) {
    let digit = digits[i]
    if (i % 2 === 1) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
  }

  const checkDigit = (10 - (sum % 10)) % 10

  return {
    valid: checkDigit === digits[10],
    formatted: cleaned,
  }
}

