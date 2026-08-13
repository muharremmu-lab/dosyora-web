import { listContactMessages } from './contact-messages'
import { listDemoLeadsForContactAdmin } from './demo-leads'
import type { ContactMessage, DemoLead } from './types'

export type ContactRequestType = 'DEMO' | 'REQUEST_SUGGESTION'

export type ContactRequestListItem = {
  key: string
  type: ContactRequestType
  id: number
  created_at: string
  name: string
  company: string | null
  phone: string | null
  email: string
  subject: string | null
  status: string
}

export type ContactRequestFilter = 'all' | 'demo' | 'request'

type ListContactRequestsOptions = {
  page?: number
  limit?: number
  search?: string
  filter?: ContactRequestFilter
  demoStatus?: string
  contactStatus?: string
}

function mapDemoLead(lead: DemoLead): ContactRequestListItem {
  return {
    key: `demo:${lead.id}`,
    type: 'DEMO',
    id: lead.id,
    created_at: lead.created_at,
    name: lead.contact_name,
    company: lead.company_name,
    phone: lead.phone,
    email: lead.email,
    subject: 'Demo Talebi',
    status: lead.status,
  }
}

function mapContactMessage(message: ContactMessage): ContactRequestListItem {
  return {
    key: `contact:${message.id}`,
    type: 'REQUEST_SUGGESTION',
    id: message.id,
    created_at: message.created_at,
    name: message.name,
    company: null,
    phone: message.phone,
    email: message.email,
    subject: message.subject,
    status: message.status,
  }
}

function matchesSearch(item: ContactRequestListItem, search?: string): boolean {
  if (!search) return true
  const haystack = [item.name, item.company, item.phone, item.email, item.subject]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return haystack.includes(search.toLowerCase())
}

export async function listContactRequests(options: ListContactRequestsOptions = {}) {
  const page = Math.max(1, options.page ?? 1)
  const limit = Math.min(100, Math.max(1, options.limit ?? 20))
  const search = options.search?.trim().toLowerCase()
  const filter = options.filter ?? 'all'

  const items: ContactRequestListItem[] = []

  if (filter === 'all' || filter === 'demo') {
    const demoResult = await listDemoLeadsForContactAdmin({
      page: 1,
      limit: 500,
      search: options.search,
      status: options.demoStatus,
    })
    items.push(...demoResult.items.map(mapDemoLead))
  }

  if (filter === 'all' || filter === 'request') {
    const contactResult = await listContactMessages({
      page: 1,
      limit: 500,
      search: options.search,
      status: options.contactStatus as never,
    })
    items.push(...contactResult.items.map(mapContactMessage))
  }

  const filtered = items.filter((item) => matchesSearch(item, search))
  filtered.sort((a, b) => b.created_at.localeCompare(a.created_at))

  const total = filtered.length
  const offset = (page - 1) * limit
  const pageItems = filtered.slice(offset, offset + limit)

  return {
    items: pageItems,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  }
}
