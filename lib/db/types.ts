import type {
  AccountType,
  ActivationStatus,
  LifecycleStatus,
  ProvisionStatus,
} from '@/lib/entitlements/constants'

export const ACCOUNT_STATUSES = ['ACTIVE', 'DISABLED'] as const

export type AccountStatus = (typeof ACCOUNT_STATUSES)[number]

export const LEAD_STATUSES = [
  'NEW',
  'CONTACT_PENDING',
  'CONTACTED',
  'DEMO_SCHEDULED',
  'PROPOSAL_SENT',
  'CUSTOMER',
  'LOST',
] as const

export type LeadStatus = (typeof LEAD_STATUSES)[number]

export const CONTACT_MESSAGE_STATUSES = ['NEW', 'READ', 'REPLIED', 'ARCHIVED'] as const

export type ContactMessageStatus = (typeof CONTACT_MESSAGE_STATUSES)[number]

export type DemoLead = {
  id: number
  created_at: string
  updated_at: string
  company_name: string
  contact_name: string
  email: string
  phone: string
  city: string | null
  employee_count: string | null
  monthly_document_count: string | null
  message: string | null
  status: LeadStatus
  assigned_to: string | null
  notes: string | null
  source: string | null
  ip_address: string | null
  user_agent: string | null
  document_limit: number | null
  account_status: AccountStatus | null
  used_documents: number
  account_type: AccountType | null
  activation_status: ActivationStatus | null
  provision_status: ProvisionStatus | null
  lifecycle_status: LifecycleStatus | null
  customer_user_id: string | null
  customer_company_id: string | null
  activation_token_hash: string | null
  activation_expires_at: string | null
  activation_used_at: string | null
  provisioned_at: string | null
}

export function getRemainingDocuments(lead: Pick<DemoLead, 'document_limit' | 'used_documents' | 'account_type'>): number | null {
  if (lead.account_type === 'OWNER' || lead.account_type === 'INTERNAL') {
    return null
  }

  if (lead.document_limit == null) return null
  return Math.max(0, lead.document_limit - (lead.used_documents ?? 0))
}

export type ContactMessage = {
  id: number
  created_at: string
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
  status: ContactMessageStatus
  notes: string | null
  ip_address: string | null
  user_agent: string | null
}

export type CreateDemoLeadInput = {
  company_name: string
  contact_name: string
  email: string
  phone: string
  city?: string | null
  employee_count?: string | null
  monthly_document_count?: string | null
  message?: string | null
  source?: string | null
  ip_address?: string | null
  user_agent?: string | null
}

export type CreateDemoAccountInput = CreateDemoLeadInput & {
  document_limit: number | null
  account_type?: AccountType
  activation_status?: ActivationStatus
  activation_token_hash?: string | null
  activation_expires_at?: string | null
  provision_status?: ProvisionStatus
  customer_user_id?: string | null
  customer_company_id?: string | null
  provisioned_at?: string | null
}

export type UpdateDemoLeadInput = {
  document_limit?: number
  account_status?: AccountStatus
  lifecycle_status?: LifecycleStatus
}

export type CreateContactMessageInput = {
  name: string
  email: string
  phone?: string | null
  subject: string
  message: string
  ip_address?: string | null
  user_agent?: string | null
}

export type UpdateContactMessageInput = {
  status?: ContactMessageStatus
  notes?: string | null
}

export type PaginatedResult<T> = {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type IpDemoQuota = {
  ip_address: string
  demo_count: number
  window_started_at: string
  window_expires_at: string
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}
