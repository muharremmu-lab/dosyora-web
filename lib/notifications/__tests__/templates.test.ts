import { describe, expect, it } from 'vitest'

import type { DemoLead } from '@/lib/db/types'

import { extractAccountingProgram, extractLeadNotes } from '@/lib/notifications/lead-fields'
import { buildDemoAdminEmail, buildDemoApplicantEmail } from '@/lib/notifications/templates'

const sampleLead: DemoLead = {
  id: 1,
  created_at: '2026-08-07T12:00:00.000Z',
  updated_at: '2026-08-07T12:00:00.000Z',
  company_name: 'Atlas A.Ş.',
  contact_name: 'Ayşe Kaya',
  email: 'ayse@example.com',
  phone: '+905551112233',
  city: null,
  employee_count: '25',
  monthly_document_count: '500',
  message: 'Muhasebe Programı: Luca\n\nEntegrasyon hakkında bilgi almak istiyoruz.',
  status: 'NEW',
  assigned_to: null,
  notes: null,
  source: 'website',
  ip_address: '127.0.0.1',
  user_agent: 'vitest',
  document_limit: 100,
  account_status: 'ACTIVE',
  used_documents: 0,
}

describe('notification templates', () => {
  it('builds applicant email without login credentials', () => {
    const email = buildDemoApplicantEmail(sampleLead)

    expect(email.subject).toBe('DOSYORA Demo Talebiniz Alındı')
    expect(email.text).toContain('Merhaba Ayşe Kaya')
    expect(email.text).toContain('Firma: Atlas A.Ş.')
    expect(email.text).not.toMatch(/şifre|kullanıcı adı|müşteri girişi/i)
    expect(email.html).not.toContain('<script')
  })

  it('escapes user-provided html in admin email', () => {
    const lead: DemoLead = {
      ...sampleLead,
      company_name: '<script>alert(1)</script>',
      message: '<img src=x onerror=alert(1)>',
    }

    const email = buildDemoAdminEmail(lead)

    expect(email.html).not.toContain('<script')
    expect(email.html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(email.text).toContain('<script>alert(1)</script>')
  })

  it('extracts accounting program and notes from lead message', () => {
    expect(extractAccountingProgram(sampleLead.message)).toBe('Luca')
    expect(extractLeadNotes(sampleLead.message)).toBe('Entegrasyon hakkında bilgi almak istiyoruz.')
  })
})
