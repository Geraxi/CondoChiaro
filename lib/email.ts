/**
 * Email Service Integration
 * Supports Resend (recommended) or SendGrid
 */

type EmailProvider = 'resend' | 'sendgrid'

const EMAIL_PROVIDER: EmailProvider = (process.env.EMAIL_PROVIDER as EmailProvider) || 'resend'

interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: string
}

/**
 * Send email using configured provider
 */
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  try {
    if (EMAIL_PROVIDER === 'resend') {
      return await sendViaResend(options)
    } else if (EMAIL_PROVIDER === 'sendgrid') {
      return await sendViaSendGrid(options)
    } else {
      throw new Error(`Unsupported email provider: ${EMAIL_PROVIDER}`)
    }
  } catch (error: any) {
    console.error('Email sending failed:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send email via Resend
 */
async function sendViaResend(options: EmailOptions) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY
  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY not configured')
  }

  const fromEmail = options.from || process.env.FROM_EMAIL || 'CondoChiaro <noreply@condochiaro.it>'

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: fromEmail,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Resend API error: ${error.message || response.statusText}`)
  }

  return { success: true }
}

/**
 * Send email via SendGrid
 */
async function sendViaSendGrid(options: EmailOptions) {
  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
  if (!SENDGRID_API_KEY) {
    throw new Error('SENDGRID_API_KEY not configured')
  }

  const fromEmail = options.from || process.env.FROM_EMAIL || 'noreply@condochiaro.it'

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: Array.isArray(options.to) ? options.to.map(email => ({ email })) : [{ email: options.to }],
          subject: options.subject,
        },
      ],
      from: { email: fromEmail },
      content: [
        {
          type: 'text/html',
          value: options.html,
        },
        ...(options.text ? [{ type: 'text/plain', value: options.text }] : []),
      ],
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`SendGrid API error: ${error || response.statusText}`)
  }

  return { success: true }
}

/**
 * Generate transactional email template with CondoChiaro branding
 */
export function generateEmailTemplate({
  title,
  content,
  ctaText,
  ctaUrl,
  footerNote,
}: {
  title: string
  content: string
  ctaText?: string
  ctaUrl?: string
  footerNote?: string
}): string {
  return `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #0E141B; border-radius: 12px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1FA9A0 0%, #27C5B9 100%); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">CondoChiaro</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Gestione Condominiale Semplificata</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px; background-color: #1A1F26;">
              <h2 style="color: #ffffff; margin: 0 0 20px 0; font-size: 22px; font-weight: 600;">${title}</h2>
              <div style="color: #e0e0e0; line-height: 1.6; font-size: 15px;">
                ${content}
              </div>
              
              ${ctaText && ctaUrl ? `
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${ctaUrl}" style="display: inline-block; background: linear-gradient(135deg, #1FA9A0 0%, #27C5B9 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">${ctaText}</a>
                  </td>
                </tr>
              </table>
              ` : ''}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 25px 30px; background-color: #0E141B; border-top: 1px solid rgba(255,255,255,0.1); text-align: center;">
              <p style="color: #9ca3af; margin: 0 0 10px 0; font-size: 13px;">
                ${footerNote || 'Questa email è stata inviata automaticamente da CondoChiaro.'}
              </p>
              <p style="color: #6b7280; margin: 0; font-size: 12px;">
                © ${new Date().getFullYear()} CondoChiaro. Tutti i diritti riservati.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

/**
 * Send payment reminder email
 */
export async function sendPaymentReminder(
  tenantEmail: string,
  tenantName: string,
  condominiumName: string,
  amount: number,
  dueDate: Date
): Promise<{ success: boolean; error?: string }> {
  const formattedDate = new Intl.DateTimeFormat('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(dueDate)

  const html = generateEmailTemplate({
    title: 'Promemoria Pagamento Condominiale',
    content: `
      <p>Caro/a ${tenantName},</p>
      <p>Ti ricordiamo che il pagamento per il condominio <strong>${condominiumName}</strong> è in scadenza.</p>
      <p style="margin: 20px 0;">
        <strong>Importo:</strong> €${amount.toFixed(2)}<br>
        <strong>Scadenza:</strong> ${formattedDate}
      </p>
      <p>Accedi alla tua area riservata per effettuare il pagamento o consultare i dettagli.</p>
    `,
    ctaText: 'Accedi all\'Area Condomino',
    ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://condochiaro.it'}/login`,
    footerNote: 'Se hai già effettuato il pagamento, ignora questa comunicazione.',
  })

  return await sendEmail({
    to: tenantEmail,
    subject: `Promemoria Pagamento - ${condominiumName}`,
    html,
  })
}

/**
 * Send tenant invitation email
 */
export async function sendTenantInvitation(
  tenantEmail: string,
  tenantName: string,
  condominiumName: string,
  adminName: string,
  invitationToken: string
): Promise<{ success: boolean; error?: string }> {
  const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://condochiaro.it'}/register?token=${invitationToken}`

  const html = generateEmailTemplate({
    title: 'Invito a CondoChiaro',
    content: `
      <p>Caro/a ${tenantName},</p>
      <p>${adminName}, amministratore del condominio <strong>${condominiumName}</strong>, ti ha invitato a utilizzare CondoChiaro.</p>
      <p>Con CondoChiaro potrai:</p>
      <ul style="margin: 15px 0; padding-left: 20px; color: #e0e0e0;">
        <li>Consultare i documenti del condominio</li>
        <li>Visualizzare i tuoi pagamenti e scadenze</li>
        <li>Inviare richieste di manutenzione</li>
        <li>Comunicare direttamente con l'amministratore</li>
      </ul>
      <p>Accetta l'invito cliccando sul pulsante qui sotto per creare il tuo account.</p>
    `,
    ctaText: 'Accetta Invito',
    ctaUrl: invitationUrl,
  })

  return await sendEmail({
    to: tenantEmail,
    subject: `Invito a CondoChiaro - ${condominiumName}`,
    html,
  })
}





