import type { DemoLead } from '@/lib/db/types'
import type { ContactMessage } from '@/lib/db/types'

type ApiErrorResponse = {
  error: string
  errors?: Array<{ field: string; message: string }>
}

async function parseError(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as ApiErrorResponse
    if (payload.errors?.length) {
      return payload.errors.map((item) => item.message).join(' ')
    }
    return payload.error || 'İstek başarısız.'
  } catch {
    return 'İstek başarısız.'
  }
}

export type DemoLeadSubmissionResult = {
  lead: DemoLead
  documentLimit: number
}

export async function submitDemoLead(payload: {
  company: string
  fullName: string
  email: string
  phone: string
  employeeCount: string
  monthlyDocuments: string
  accountingProgram: string
  message: string
  source?: string
  inquiryOnly?: boolean
}): Promise<DemoLeadSubmissionResult> {
  const response = await fetch('/api/demo-leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      company_name: payload.company,
      contact_name: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      employee_count: payload.employeeCount,
      monthly_document_count: payload.monthlyDocuments,
      accounting_program: payload.accountingProgram,
      message: payload.message,
      source: payload.source ?? 'website',
      inquiry_only: payload.inquiryOnly ?? false,
    }),
  })

  if (!response.ok) {
    throw new Error(await parseError(response))
  }

  const data = (await response.json()) as {
    lead: DemoLead
    document_limit?: number
    inquiry?: boolean
  }

  return {
    lead: data.lead,
    documentLimit: data.document_limit ?? 0,
  }
}

export async function submitContactMessage(payload: {
  fullName: string
  email: string
  phone: string
  subject: string
  message: string
}): Promise<ContactMessage> {
  const response = await fetch('/api/contact-messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      subject: payload.subject,
      message: payload.message,
    }),
  })

  if (!response.ok) {
    throw new Error(await parseError(response))
  }

  const data = (await response.json()) as { message: ContactMessage }
  return data.message
}
