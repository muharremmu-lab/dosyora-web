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
  document_limit: 20,
  account_status: 'ACTIVE',
  used_documents: 0,
  account_type: 'DEMO',
  activation_status: 'PENDING',
  provision_status: 'LOCAL_ONLY',
  lifecycle_status: 'ACTIVE',
  customer_user_id: null,
  customer_company_id: null,
  activation_token_hash: 'hash',
  activation_expires_at: '2099-01-01T00:00:00.000Z',
  activation_used_at: null,
  provisioned_at: null,
}

describe('notification templates', () => {
  it('builds ready demo email with activation link and no plaintext password', () => {
    const email = buildDemoApplicantEmail(sampleLead, 'activation-token-value')

    expect(email.subject).toBe('DOSYORA Demo Hesabınız Hazır')
    expect(email.text).toContain('demo hesabınız hazır')
    expect(email.text).toContain('20')
    expect(email.text).toContain('/activate?token=')
    expect(email.text).not.toMatch(/şifre:|password:/i)
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
