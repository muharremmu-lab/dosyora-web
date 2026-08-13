import type { AccountStatus, ContactMessageStatus } from '@/lib/db/types'
import type { AccountType, ActivationStatus } from '@/lib/entitlements/constants'

export const ACCOUNT_STATUS_LABELS: Record<AccountStatus, string> = {
  ACTIVE: 'Aktif',
  DISABLED: 'Devre Dışı',
}

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  DEMO: 'Demo',
  OWNER: 'Owner',
  INTERNAL: 'Internal',
  PAID: 'Paid',
}

export const ACTIVATION_STATUS_LABELS: Record<ActivationStatus, string> = {
  PENDING: 'Aktivasyon Bekliyor',
  ACTIVATED: 'Aktive Edildi',
  EXPIRED: 'Süresi Doldu',
}

export const PROVISION_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Provisioning Bekliyor',
  PROVISIONED: 'BelgeOkumaWeb Provisioned',
  LOCAL_ONLY: 'Yalnızca Yerel',
  FAILED: 'Provisioning Başarısız',
  INQUIRY: 'Demo Talebi (İnceleme)',
}

export function formatDocumentQuotaLabel(lead: {
  account_type: AccountType | null
  document_limit: number | null
  used_documents: number
}): { limit: string; remaining: string } {
  if (lead.account_type === 'OWNER' || lead.account_type === 'INTERNAL') {
    return { limit: 'Sınırsız', remaining: 'Sınırsız' }
  }

  const limit = lead.document_limit ?? '—'
  const remaining =
    lead.document_limit == null
      ? '—'
      : String(Math.max(0, lead.document_limit - (lead.used_documents ?? 0)))

  return { limit: String(limit), remaining }
}
export const CONTACT_STATUS_LABELS: Record<ContactMessageStatus, string> = {
  NEW: 'Yeni',
  READ: 'İncelendi',
  REPLIED: 'Dönüş Yapıldı',
  ARCHIVED: 'Kapandı',
}

export const LEAD_STATUS_LABELS: Record<string, string> = {
  NEW: 'Yeni',
  CONTACT_PENDING: 'İncelendi',
  CONTACTED: 'İncelendi',
  DEMO_SCHEDULED: 'Dönüş Yapıldı',
  PROPOSAL_SENT: 'Dönüş Yapıldı',
  CUSTOMER: 'Kapandı',
  LOST: 'Kapandı',
}

export const CONTACT_REQUEST_TYPE_LABELS = {
  DEMO: 'Demo Talebi',
  REQUEST_SUGGESTION: 'İstek / Öneri',
} as const

export function formatContactRequestStatus(type: 'DEMO' | 'REQUEST_SUGGESTION', status: string): string {
  if (type === 'REQUEST_SUGGESTION') {
    return CONTACT_STATUS_LABELS[status as ContactMessageStatus] ?? status
  }
  return LEAD_STATUS_LABELS[status] ?? status
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}
