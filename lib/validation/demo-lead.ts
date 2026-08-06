import type { CreateDemoLeadInput } from '@/lib/db/types'

import {
  collectErrors,
  validateEmail,
  validateOptional,
  validatePhone,
  validateRequired,
  type ValidationResult,
} from './common'

export type DemoLeadFormPayload = {
  company_name: string
  contact_name: string
  email: string
  phone: string
  city?: string
  employee_count?: string
  monthly_document_count?: string
  message?: string
  accounting_program?: string
  source?: string
}

export function validateDemoLeadPayload(body: unknown): ValidationResult<CreateDemoLeadInput> {
  if (!body || typeof body !== 'object') {
    return { success: false, errors: [{ field: 'body', message: 'Geçersiz istek gövdesi.' }] }
  }

  const payload = body as Record<string, unknown>

  const companyName = String(payload.company_name ?? payload.company ?? '')
  const contactName = String(payload.contact_name ?? payload.fullName ?? payload.full_name ?? '')
  const email = String(payload.email ?? '')
  const phone = String(payload.phone ?? '')
  const city = payload.city ? String(payload.city) : null
  const employeeCount = String(payload.employee_count ?? payload.employeeCount ?? '')
  const monthlyDocumentCount = String(
    payload.monthly_document_count ?? payload.monthlyDocuments ?? '',
  )
  const userMessage = payload.message ? String(payload.message) : ''
  const accountingProgram = payload.accounting_program
    ? String(payload.accounting_program)
    : payload.accountingProgram
      ? String(payload.accountingProgram)
      : ''

  const errors = collectErrors([
    validateRequired(companyName, 'Firma adı', 200),
    validateRequired(contactName, 'Yetkili adı', 200),
    validateEmail(email),
    validatePhone(phone, true),
    validateOptional(city ?? undefined, 120),
    validateRequired(employeeCount, 'Çalışan sayısı', 50),
    validateRequired(monthlyDocumentCount, 'Aylık belge sayısı', 50),
    validateOptional(userMessage, 5000),
    validateOptional(accountingProgram, 200),
  ])

  if (errors.length > 0) {
    return { success: false, errors }
  }

  const messageParts: string[] = []
  if (accountingProgram.trim()) {
    messageParts.push(`Muhasebe Programı: ${accountingProgram.trim()}`)
  }
  if (userMessage.trim()) {
    messageParts.push(userMessage.trim())
  }

  return {
    success: true,
    data: {
      company_name: companyName.trim(),
      contact_name: contactName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      city: city?.trim() || null,
      employee_count: employeeCount.trim(),
      monthly_document_count: monthlyDocumentCount.trim(),
      message: messageParts.length > 0 ? messageParts.join('\n\n') : null,
      source: payload.source ? String(payload.source).trim() : 'website',
    },
  }
}
