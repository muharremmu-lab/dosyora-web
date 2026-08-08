import type { DemoLead } from '@/lib/db/types'

const ACCOUNTING_PROGRAM_PREFIX = 'Muhasebe Programı: '

export function extractAccountingProgram(message: string | null): string | null {
  if (!message?.startsWith(ACCOUNTING_PROGRAM_PREFIX)) {
    return null
  }

  const remainder = message.slice(ACCOUNTING_PROGRAM_PREFIX.length)
  const splitIndex = remainder.indexOf('\n\n')
  const value = splitIndex >= 0 ? remainder.slice(0, splitIndex) : remainder
  return value.trim() || null
}

export function extractLeadNotes(message: string | null): string | null {
  if (!message?.trim()) return null

  if (!message.startsWith(ACCOUNTING_PROGRAM_PREFIX)) {
    return message.trim()
  }

  const splitIndex = message.indexOf('\n\n')
  if (splitIndex < 0) {
    return null
  }

  const notes = message.slice(splitIndex + 2).trim()
  return notes || null
}

export type DemoLeadAdminField = {
  label: string
  value: string | null
}

export function buildDemoLeadAdminFields(lead: DemoLead): DemoLeadAdminField[] {
  const accountingProgram = extractAccountingProgram(lead.message)
  const notes = extractLeadNotes(lead.message)

  const fields: DemoLeadAdminField[] = [
    { label: 'Firma', value: lead.company_name },
    { label: 'Yetkili', value: lead.contact_name },
    { label: 'E-posta', value: lead.email },
    { label: 'Telefon', value: lead.phone },
    { label: 'Çalışan Sayısı', value: lead.employee_count },
    { label: 'Aylık Belge Sayısı', value: lead.monthly_document_count },
    { label: 'Muhasebe Programı', value: accountingProgram },
    { label: 'Mesaj / Not', value: notes ?? (accountingProgram ? null : lead.message) },
    { label: 'Kaynak', value: lead.source },
    { label: 'Başvuru Zamanı', value: lead.created_at },
  ]

  return fields.filter((field) => field.value?.trim())
}
