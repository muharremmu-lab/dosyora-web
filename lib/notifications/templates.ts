import type { ContactMessage, DemoLead } from '@/lib/db/types'

import { buildActivationUrl } from '@/lib/activation/tokens'
import { DEMO_DOCUMENT_LIMIT } from '@/lib/entitlements/constants'
import { getCustomerLoginUrl } from '@/lib/customer-portal'
import { siteConfig } from '@/lib/site'

import { escapeHtml, escapeHtmlOrDash } from './escape'
import { buildDemoLeadAdminFields } from './lead-fields'

type EmailTemplate = {
  subject: string
  html: string
  text: string
}

function wrapEmailHtml(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="tr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f6f8;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:28px 24px;">
            <tr>
              <td>
                ${bodyHtml}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

function renderFieldListHtml(fields: Array<{ label: string; value: string | null }>): string {
  return fields
    .map(
      (field) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #eef2f7;color:#6b7280;font-size:14px;width:38%;vertical-align:top;">
            ${escapeHtml(field.label)}
          </td>
          <td style="padding:8px 0;border-bottom:1px solid #eef2f7;color:#111827;font-size:14px;vertical-align:top;">
            ${escapeHtmlOrDash(field.value)}
          </td>
        </tr>`,
    )
    .join('')
}

function renderFieldListText(fields: Array<{ label: string; value: string | null }>): string {
  return fields.map((field) => `${field.label}: ${field.value?.trim() || '—'}`).join('\n')
}

export function buildDemoApplicantEmail(lead: DemoLead, activationToken?: string): EmailTemplate {
  const contactName = lead.contact_name.trim()
  const companyName = lead.company_name.trim()
  const loginUrl = getCustomerLoginUrl()
  const activationUrl = activationToken ? buildActivationUrl(activationToken, siteConfig.url) : null

  const textLines = [
    `Merhaba ${contactName},`,
    '',
    'DOSYORA demo hesabınız hazır.',
    '',
    `Firma: ${companyName}`,
    `Ücretsiz belge hakkınız: ${DEMO_DOCUMENT_LIMIT}`,
    '',
  ]

  if (activationUrl) {
    textLines.push('Hesabınızı kullanmaya başlamak için aşağıdaki bağlantıdan şifrenizi oluşturun:')
    textLines.push(activationUrl)
    textLines.push('')
  }

  textLines.push(`Giriş adresi: ${loginUrl}`)
  textLines.push('')
  textLines.push('Sorularınız için info@dosyora.com adresinden bize ulaşabilirsiniz.')
  textLines.push('')
  textLines.push('DOSYORA')
  textLines.push('Akıllı Belge ve İş Süreçleri Platformu')

  const activationHtml = activationUrl
    ? `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;">Hesabınızı kullanmaya başlamak için aşağıdaki bağlantıdan şifrenizi oluşturun:</p>
       <p style="margin:0 0 16px;font-size:15px;line-height:1.6;"><a href="${escapeHtml(activationUrl)}" style="color:#0f766e;">Şifremi oluştur</a></p>`
    : ''

  const html = wrapEmailHtml(
    'DOSYORA Demo Hesabınız Hazır',
    `
      <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Merhaba ${escapeHtml(contactName)},</p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">DOSYORA demo hesabınız hazır.</p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;"><strong>Firma:</strong> ${escapeHtml(companyName)}</p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;"><strong>Ücretsiz belge hakkınız:</strong> ${DEMO_DOCUMENT_LIMIT}</p>
      ${activationHtml}
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;"><strong>Giriş adresi:</strong> ${escapeHtml(loginUrl)}</p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">Sorularınız için <a href="mailto:info@dosyora.com">info@dosyora.com</a> adresinden bize ulaşabilirsiniz.</p>
      <p style="margin:24px 0 0;font-size:14px;line-height:1.5;color:#374151;">
        <strong>DOSYORA</strong><br />
        Akıllı Belge ve İş Süreçleri Platformu
      </p>
    `,
  )

  return {
    subject: 'DOSYORA Demo Hesabınız Hazır',
    html,
    text: textLines.join('\n'),
  }
}

export function buildDemoAdminEmail(lead: DemoLead): EmailTemplate {
  const fields = buildDemoLeadAdminFields(lead)

  const text = ['Yeni bir DOSYORA demo talebi alındı.', '', renderFieldListText(fields)].join('\n')

  const html = wrapEmailHtml(
    'Yeni DOSYORA Demo Talebi',
    `
      <h1 style="margin:0 0 16px;font-size:20px;line-height:1.4;color:#111827;">Yeni DOSYORA Demo Talebi</h1>
      <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#374151;">Yeni bir demo talebi alındı. Başvuru detayları aşağıdadır.</p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        ${renderFieldListHtml(fields)}
      </table>
    `,
  )

  return {
    subject: 'Yeni DOSYORA Demo Talebi',
    html,
    text,
  }
}

export function buildContactAdminEmail(message: ContactMessage): EmailTemplate {
  const fields = [
    { label: 'Ad Soyad', value: message.name },
    { label: 'E-posta', value: message.email },
    { label: 'Telefon', value: message.phone },
    { label: 'Konu', value: message.subject },
    { label: 'Mesaj', value: message.message },
    { label: 'Kaynak', value: 'website' },
    { label: 'Başvuru Zamanı', value: message.created_at },
  ]

  const text = ['Yeni bir DOSYORA iletişim mesajı alındı.', '', renderFieldListText(fields)].join('\n')

  const html = wrapEmailHtml(
    'Yeni DOSYORA İletişim Mesajı',
    `
      <h1 style="margin:0 0 16px;font-size:20px;line-height:1.4;color:#111827;">Yeni DOSYORA İletişim Mesajı</h1>
      <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#374151;">İletişim formundan yeni bir mesaj alındı.</p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        ${renderFieldListHtml(fields)}
      </table>
    `,
  )

  return {
    subject: 'Yeni DOSYORA İletişim Mesajı',
    html,
    text,
  }
}
