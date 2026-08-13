import { dbInsertReturningId, dbQueryAll, dbQueryOne, dbRun } from './query'
import type {
  AccountType,
  ActivationStatus,
  LifecycleStatus,
  ProvisionStatus,
} from '@/lib/entitlements/constants'
import type {
  AccountStatus,
  CreateDemoAccountInput,
  CreateDemoLeadInput,
  DemoLead,
  LeadStatus,
  PaginatedResult,
  UpdateDemoLeadInput,
} from './types'
import { DEMO_DOCUMENT_LIMIT } from '@/lib/entitlements/constants'
import { normalizeEmail } from './types'

type DemoLeadRow = DemoLead

type ListDemoLeadsOptions = {
  page?: number
  limit?: number
  search?: string
  accountStatus?: AccountStatus
  source?: string
  lifecycleStatus?: LifecycleStatus
}

function mapRow(row: DemoLeadRow): DemoLead {
  return {
    ...row,
    used_documents: Number(row.used_documents ?? 0),
  }
}

export async function findDemoAccountByEmail(email: string): Promise<DemoLead | null> {
  const row = await dbQueryOne<DemoLeadRow>(
    'findDemoAccountByEmail',
    `
      SELECT * FROM demo_leads
      WHERE lower(email) = lower(?)
        AND account_status IN ('ACTIVE', 'DISABLED')
        AND COALESCE(lifecycle_status, 'ACTIVE') = 'ACTIVE'
        AND COALESCE(account_type, 'DEMO') = 'DEMO'
      ORDER BY created_at ASC
      LIMIT 1
    `,
    [normalizeEmail(email)],
  )

  return row ? mapRow(row) : null
}

export async function createDemoAccount(input: CreateDemoAccountInput): Promise<DemoLead> {
  const id = await dbInsertReturningId(
    'createDemoAccount',
    `
    INSERT INTO demo_leads (
      company_name,
      contact_name,
      email,
      phone,
      city,
      employee_count,
      monthly_document_count,
      message,
      source,
      ip_address,
      user_agent,
      document_limit,
      account_status,
      status,
      used_documents,
      account_type,
      activation_status,
      provision_status,
      lifecycle_status,
      customer_user_id,
      customer_company_id,
      activation_token_hash,
      activation_expires_at,
      provisioned_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', 'NEW', 0, ?, ?, ?, 'ACTIVE', ?, ?, ?, ?, ?)
    RETURNING id
  `,
    [
      input.company_name,
      input.contact_name,
      normalizeEmail(input.email),
      input.phone,
      input.city ?? null,
      input.employee_count ?? null,
      input.monthly_document_count ?? null,
      input.message ?? null,
      input.source ?? 'website',
      input.ip_address ?? null,
      input.user_agent ?? null,
      input.document_limit,
      input.account_type ?? 'DEMO',
      input.activation_status ?? 'PENDING',
      input.provision_status ?? 'PENDING',
      input.customer_user_id ?? null,
      input.customer_company_id ?? null,
      input.activation_token_hash ?? null,
      input.activation_expires_at ?? null,
      input.provisioned_at ?? null,
    ],
  )

  return (await getDemoLeadById(id))!
}

export async function createOwnerAccount(input: {
  company_name: string
  contact_name: string
  email: string
  phone: string
  customer_user_id?: string | null
  customer_company_id?: string | null
}): Promise<DemoLead> {
  return createDemoAccount({
    company_name: input.company_name,
    contact_name: input.contact_name,
    email: input.email,
    phone: input.phone,
    document_limit: null,
    account_type: 'OWNER',
    activation_status: 'ACTIVATED',
    provision_status: input.customer_user_id ? 'PROVISIONED' : 'LOCAL_ONLY',
    customer_user_id: input.customer_user_id ?? null,
    customer_company_id: input.customer_company_id ?? null,
    provisioned_at: input.customer_user_id ? new Date().toISOString() : null,
    activation_token_hash: null,
    activation_expires_at: null,
  })
}

/** @deprecated Use createDemoAccount via demo policy service */
export async function createDemoLead(input: CreateDemoLeadInput): Promise<DemoLead> {
  return createDemoAccount({
    ...input,
    document_limit: DEMO_DOCUMENT_LIMIT,
  })
}

export async function createDemoInquiry(input: CreateDemoLeadInput): Promise<DemoLead> {
  const id = await dbInsertReturningId(
    'createDemoInquiry',
    `
    INSERT INTO demo_leads (
      company_name,
      contact_name,
      email,
      phone,
      city,
      employee_count,
      monthly_document_count,
      message,
      source,
      ip_address,
      user_agent,
      document_limit,
      account_status,
      status,
      used_documents,
      account_type,
      activation_status,
      provision_status,
      lifecycle_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, 'NEW', 0, NULL, NULL, 'INQUIRY', 'ACTIVE')
    RETURNING id
  `,
    [
      input.company_name,
      input.contact_name,
      normalizeEmail(input.email),
      input.phone,
      input.city ?? null,
      input.employee_count ?? null,
      input.monthly_document_count ?? null,
      input.message ?? null,
      input.source ?? 'website',
      input.ip_address ?? null,
      input.user_agent ?? null,
    ],
  )

  return (await getDemoLeadById(id))!
}

type ListDemoLeadsForContactAdminOptions = {
  page?: number
  limit?: number
  search?: string
  status?: string
}

export async function listDemoLeadsForContactAdmin(
  options: ListDemoLeadsForContactAdminOptions = {},
): Promise<PaginatedResult<DemoLead>> {
  const page = Math.max(1, options.page ?? 1)
  const limit = Math.min(500, Math.max(1, options.limit ?? 20))
  const offset = (page - 1) * limit

  const conditions: string[] = ["COALESCE(lifecycle_status, 'ACTIVE') = 'ACTIVE'"]
  const params: Array<string | number> = []

  if (options.search) {
    conditions.push('(company_name LIKE ? OR contact_name LIKE ? OR email LIKE ? OR phone LIKE ?)')
    const search = `%${options.search}%`
    params.push(search, search, search, search)
  }

  if (options.status) {
    conditions.push('status = ?')
    params.push(options.status)
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`

  const totalRow = await dbQueryOne<{ count: number }>(
    'listDemoLeadsForContactAdmin.count',
    `SELECT COUNT(*) as count FROM demo_leads ${whereClause}`,
    params,
  )

  const rows = await dbQueryAll<DemoLeadRow>(
    'listDemoLeadsForContactAdmin.items',
    `SELECT * FROM demo_leads ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  )

  const total = Number(totalRow?.count ?? 0)

  return {
    items: rows.map(mapRow),
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  }
}

export async function getDemoLeadById(id: number): Promise<DemoLead | null> {
  const row = await dbQueryOne<DemoLeadRow>('getDemoLeadById', 'SELECT * FROM demo_leads WHERE id = ?', [id])
  return row ? mapRow(row) : null
}

export async function getDemoLeadByActivationTokenHash(tokenHash: string): Promise<DemoLead | null> {
  const row = await dbQueryOne<DemoLeadRow>(
    'getDemoLeadByActivationTokenHash',
    `
      SELECT * FROM demo_leads
      WHERE activation_token_hash = ?
        AND COALESCE(lifecycle_status, 'ACTIVE') = 'ACTIVE'
      LIMIT 1
    `,
    [tokenHash],
  )

  return row ? mapRow(row) : null
}

export async function listDemoLeads(
  options: ListDemoLeadsOptions = {},
): Promise<PaginatedResult<DemoLead>> {
  const page = Math.max(1, options.page ?? 1)
  const limit = Math.min(100, Math.max(1, options.limit ?? 20))
  const offset = (page - 1) * limit

  const conditions: string[] = [
    "account_status IN ('ACTIVE', 'DISABLED')",
    "COALESCE(lifecycle_status, 'ACTIVE') = 'ACTIVE'",
  ]
  const params: Array<string | number> = []

  if (options.search) {
    conditions.push('(company_name LIKE ? OR contact_name LIKE ? OR email LIKE ? OR phone LIKE ?)')
    const search = `%${options.search}%`
    params.push(search, search, search, search)
  }

  if (options.accountStatus) {
    conditions.push('account_status = ?')
    params.push(options.accountStatus)
  }

  if (options.source) {
    conditions.push('source = ?')
    params.push(options.source)
  }

  if (options.lifecycleStatus) {
    conditions.push('COALESCE(lifecycle_status, \'ACTIVE\') = ?')
    params.push(options.lifecycleStatus)
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`

  const totalRow = await dbQueryOne<{ count: number }>(
    'listDemoLeads.count',
    `SELECT COUNT(*) as count FROM demo_leads ${whereClause}`,
    params,
  )

  const rows = await dbQueryAll<DemoLeadRow>(
    'listDemoLeads.items',
    `SELECT * FROM demo_leads ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  )

  const total = Number(totalRow?.count ?? 0)

  return {
    items: rows.map(mapRow),
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  }
}

export async function updateDemoLead(
  id: number,
  input: UpdateDemoLeadInput,
): Promise<DemoLead | null> {
  const existing = await getDemoLeadById(id)
  if (!existing) return null

  await dbRun(
    'updateDemoLead',
    `
    UPDATE demo_leads
    SET
      document_limit = ?,
      account_status = ?,
      lifecycle_status = ?,
      status = ?,
      notes = ?,
      updated_at = datetime('now')
    WHERE id = ?
  `,
    [
      input.document_limit !== undefined ? input.document_limit : existing.document_limit,
      input.account_status !== undefined ? input.account_status : existing.account_status,
      input.lifecycle_status !== undefined ? input.lifecycle_status : existing.lifecycle_status,
      input.status !== undefined ? input.status : existing.status,
      input.notes !== undefined ? input.notes : existing.notes,
      id,
    ],
  )

  return getDemoLeadById(id)
}

export async function markDemoLeadActivated(input: {
  id: number
  customerUserId: string
  customerCompanyId: string
  provisionStatus: ProvisionStatus
}): Promise<DemoLead | null> {
  await dbRun(
    'markDemoLeadActivated',
    `
    UPDATE demo_leads
    SET
      activation_status = 'ACTIVATED',
      activation_used_at = datetime('now'),
      activation_token_hash = NULL,
      activation_expires_at = NULL,
      customer_user_id = ?,
      customer_company_id = ?,
      provision_status = ?,
      provisioned_at = datetime('now'),
      updated_at = datetime('now')
    WHERE id = ?
  `,
    [input.customerUserId, input.customerCompanyId, input.provisionStatus, input.id],
  )

  return getDemoLeadById(input.id)
}

export async function updateDemoLeadProvision(input: {
  id: number
  customerUserId: string | null
  customerCompanyId: string | null
  provisionStatus: ProvisionStatus
}): Promise<DemoLead | null> {
  await dbRun(
    'updateDemoLeadProvision',
    `
    UPDATE demo_leads
    SET
      customer_user_id = ?,
      customer_company_id = ?,
      provision_status = ?,
      provisioned_at = CASE WHEN ? IN ('PROVISIONED', 'LOCAL_ONLY') THEN datetime('now') ELSE provisioned_at END,
      updated_at = datetime('now')
    WHERE id = ?
  `,
    [
      input.customerUserId,
      input.customerCompanyId,
      input.provisionStatus,
      input.provisionStatus,
      input.id,
    ],
  )

  return getDemoLeadById(input.id)
}

export async function archiveDemoLead(id: number): Promise<DemoLead | null> {
  const existing = await getDemoLeadById(id)
  if (!existing) return null

  if (existing.account_type !== 'DEMO') {
    throw new Error('Only DEMO accounts can be archived through demo cleanup.')
  }

  await dbRun(
    'archiveDemoLead',
    `
    UPDATE demo_leads
    SET lifecycle_status = 'ARCHIVED', account_status = 'DISABLED', updated_at = datetime('now')
    WHERE id = ?
  `,
    [id],
  )

  return getDemoLeadById(id)
}

export async function incrementUsedDocuments(id: number, count = 1): Promise<DemoLead | null> {
  const existing = await getDemoLeadById(id)
  if (!existing) return null

  const nextCount = Math.max(0, (existing.used_documents ?? 0) + count)

  await dbRun(
    'incrementUsedDocuments',
    `
    UPDATE demo_leads
    SET used_documents = ?, updated_at = datetime('now')
    WHERE id = ?
  `,
    [nextCount, id],
  )

  return getDemoLeadById(id)
}

export async function countDemoAccountsByStatus(status: AccountStatus): Promise<number> {
  const row = await dbQueryOne<{ count: number }>(
    'countDemoAccountsByStatus',
    `
      SELECT COUNT(*) as count FROM demo_leads
      WHERE account_status = ?
        AND COALESCE(lifecycle_status, 'ACTIVE') = 'ACTIVE'
    `,
    [status],
  )
  return Number(row?.count ?? 0)
}

export async function countDemoAccountsToday(): Promise<number> {
  const row = await dbQueryOne<{ count: number }>(
    'countDemoAccountsToday',
    `
      SELECT COUNT(*) as count FROM demo_leads
      WHERE account_status IN ('ACTIVE', 'DISABLED')
        AND COALESCE(lifecycle_status, 'ACTIVE') = 'ACTIVE'
        AND date(created_at) = date('now', 'localtime')
    `,
  )
  return Number(row?.count ?? 0)
}

export async function countAllDemoAccounts(): Promise<number> {
  const row = await dbQueryOne<{ count: number }>(
    'countAllDemoAccounts',
    `
      SELECT COUNT(*) as count FROM demo_leads
      WHERE account_status IN ('ACTIVE', 'DISABLED')
        AND COALESCE(lifecycle_status, 'ACTIVE') = 'ACTIVE'
    `,
  )
  return Number(row?.count ?? 0)
}

export async function countDemoAccountsPendingActivation(): Promise<number> {
  const row = await dbQueryOne<{ count: number }>(
    'countDemoAccountsPendingActivation',
    `
      SELECT COUNT(*) as count FROM demo_leads
      WHERE COALESCE(activation_status, 'PENDING') = 'PENDING'
        AND COALESCE(lifecycle_status, 'ACTIVE') = 'ACTIVE'
        AND COALESCE(account_type, 'DEMO') = 'DEMO'
    `,
  )
  return Number(row?.count ?? 0)
}

export async function countDemoAccountsQuotaExhausted(): Promise<number> {
  const row = await dbQueryOne<{ count: number }>(
    'countDemoAccountsQuotaExhausted',
    `
      SELECT COUNT(*) as count FROM demo_leads
      WHERE COALESCE(account_type, 'DEMO') = 'DEMO'
        AND COALESCE(lifecycle_status, 'ACTIVE') = 'ACTIVE'
        AND document_limit IS NOT NULL
        AND used_documents >= document_limit
    `,
  )
  return Number(row?.count ?? 0)
}

export async function countDemoAccountsLast7Days(): Promise<number> {
  const row = await dbQueryOne<{ count: number }>(
    'countDemoAccountsLast7Days',
    `
      SELECT COUNT(*) as count FROM demo_leads
      WHERE COALESCE(lifecycle_status, 'ACTIVE') = 'ACTIVE'
        AND datetime(created_at) >= datetime('now', '-7 days')
    `,
  )
  return Number(row?.count ?? 0)
}

export async function getDemoLeadByEmail(email: string): Promise<DemoLead | null> {
  const row = await dbQueryOne<DemoLeadRow>(
    'getDemoLeadByEmail',
    'SELECT * FROM demo_leads WHERE lower(email) = lower(?) ORDER BY created_at DESC LIMIT 1',
    [normalizeEmail(email)],
  )
  return row ? mapRow(row) : null
}

/** @deprecated */
export async function countDemoLeadsByStatus(status: AccountStatus): Promise<number> {
  return countDemoAccountsByStatus(status)
}

/** @deprecated */
export async function countDemoLeadsToday(): Promise<number> {
  return countDemoAccountsToday()
}

/** @deprecated */
export async function countAllDemoLeads(): Promise<number> {
  return countAllDemoAccounts()
}

export type { AccountType, ActivationStatus }
