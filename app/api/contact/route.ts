import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import { errorResponse, successResponse } from '@/lib/api-response'

/**
 * Contact Form Handler
 * POST /api/contact
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, subject, message } = body

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        errorResponse('Name, email, and message are required', 'VALIDATION_ERROR'),
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        errorResponse('Invalid email address', 'VALIDATION_ERROR'),
        { status: 400 }
      )
    }

    // Send email to support
    const supportEmail = process.env.SUPPORT_EMAIL || 'ciao@condochiaro.com'
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1FA9A0;">Nuovo messaggio dal form di contatto</h2>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Nome:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${subject ? `<p><strong>Oggetto:</strong> ${subject}</p>` : ''}
          <p><strong>Messaggio:</strong></p>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
      </div>
    `

    const emailText = `
Nuovo messaggio dal form di contatto

Nome: ${name}
Email: ${email}
${subject ? `Oggetto: ${subject}\n` : ''}
Messaggio:
${message}
    `

    const result = await sendEmail({
      to: supportEmail,
      subject: subject ? `Contatto: ${subject}` : `Nuovo messaggio da ${name}`,
      html: emailHtml,
      text: emailText,
      from: process.env.FROM_EMAIL || 'CondoChiaro <noreply@condochiaro.it>',
    })

    if (!result.success) {
      console.error('Failed to send contact email:', result.error)
      return NextResponse.json(
        errorResponse('Failed to send message. Please try again later.', 'EMAIL_ERROR'),
        { status: 500 }
      )
    }

    // Send confirmation email to user
    const confirmationHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1FA9A0;">Grazie per averci contattato!</h2>
        <p>Abbiamo ricevuto il tuo messaggio e ti risponderemo al più presto.</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Il tuo messaggio:</strong></p>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
        <p style="margin-top: 20px;">Cordiali saluti,<br>Il team CondoChiaro</p>
      </div>
    `

    await sendEmail({
      to: email,
      subject: 'Abbiamo ricevuto il tuo messaggio - CondoChiaro',
      html: confirmationHtml,
      text: `Grazie per averci contattato! Abbiamo ricevuto il tuo messaggio e ti risponderemo al più presto.\n\nIl tuo messaggio:\n${message}\n\nCordiali saluti,\nIl team CondoChiaro`,
      from: process.env.FROM_EMAIL || 'CondoChiaro <noreply@condochiaro.it>',
    })

    return NextResponse.json(
      successResponse({ message: 'Message sent successfully' }, 'Message sent successfully'),
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      errorResponse('An error occurred while processing your request', 'SERVER_ERROR'),
      { status: 500 }
    )
  }
}
