import { dbInsert, dbRun, dbQueryAll, dbQueryOne } from './query'
import type {
  AccountStatus,
  CreateDemoAccountInput,
  CreateDemoLeadInput,
  DemoLead,
  PaginatedResult,
  UpdateDemoLeadInput,
} from './types'

type DemoLeadRow = DemoLead

type ListDemoLeadsOptions = {
  page?: number
  limit?: number
  search?: string
  accountStatus?: AccountStatus
  source?: string
}

function mapRow(row: DemoLeadRow): DemoLead {
  return {
    ...row,
    used_documents: Number(row.used_documents ?? 0),
  }
}

export async function findDemoAccountByEmail(email: string): Promise<DemoLead | null> {
  const row = await dbQueryOne<DemoLeadRow>(
    `
      SELECT * FROM demo_leads
      WHERE lower(email) = lower(:email)
        AND account_status IN ('ACTIVE', 'DISABLED')
      ORDER BY created_at ASC
      LIMIT 1
    `,
    { email },
  )

  return row ? mapRow(row) : null
}

export async function createDemoAccount(input: CreateDemoAccountInput): Promise<DemoLead> {
  const id = await dbInsert(
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
      used_documents
    ) VALUES (
      :company_name,
      :contact_name,
      :email,
      :phone,
      :city,
      :employee_count,
      :monthly_document_count,
      :message,
      :source,
      :ip_address,
      :user_agent,
      :document_limit,
      'ACTIVE',
      'NEW',
      0
    )
  `,
    {
      company_name: input.company_name,
      contact_name: input.contact_name,
      email: input.email,
      phone: input.phone,
      city: input.city ?? null,
      employee_count: input.employee_count ?? null,
      monthly_document_count: input.monthly_document_count ?? null,
      message: input.message ?? null,
      source: input.source ?? 'website',
      ip_address: input.ip_address ?? null,
      user_agent: input.user_agent ?? null,
      document_limit: input.document_limit,
    },
  )

  return (await getDemoLeadById(id))!
}

/** @deprecated Use createDemoAccount via demo policy service */
export async function createDemoLead(input: CreateDemoLeadInput): Promise<DemoLead> {
  return createDemoAccount({
    ...input,
    document_limit: 100,
  })
}

export async function getDemoLeadById(id: number): Promise<DemoLead | null> {
  const row = await dbQueryOne<DemoLeadRow>('SELECT * FROM demo_leads WHERE id = :id', { id })
  return row ? mapRow(row) : null
}

export async function listDemoLeads(
  options: ListDemoLeadsOptions = {},
): Promise<PaginatedResult<DemoLead>> {
  const page = Math.max(1, options.page ?? 1)
  const limit = Math.min(100, Math.max(1, options.limit ?? 20))
  const offset = (page - 1) * limit

  const conditions: string[] = ["account_status IN ('ACTIVE', 'DISABLED')"]
  const params: Record<string, string | number> = {}

  if (options.search) {
    conditions.push(
      `(company_name LIKE :search OR contact_name LIKE :search OR email LIKE :search OR phone LIKE :search)`,
    )
    params.search = `%${options.search}%`
  }

  if (options.accountStatus) {
    conditions.push('account_status = :account_status')
    params.account_status = options.accountStatus
  }

  if (options.source) {
    conditions.push('source = :source')
    params.source = options.source
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`

  const totalRow = await dbQueryOne<{ count: number }>(
    `SELECT COUNT(*) as count FROM demo_leads ${whereClause}`,
    params,
  )

  const rows = await dbQueryAll<DemoLeadRow>(
    `SELECT * FROM demo_leads ${whereClause} ORDER BY created_at DESC LIMIT :limit OFFSET :offset`,
    { ...params, limit, offset },
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
    `
    UPDATE demo_leads
    SET
      document_limit = :document_limit,
      account_status = :account_status,
      updated_at = datetime('now')
    WHERE id = :id
  `,
    {
      id,
      document_limit:
        input.document_limit !== undefined ? input.document_limit : existing.document_limit,
      account_status:
        input.account_status !== undefined ? input.account_status : existing.account_status,
    },
  )

  return getDemoLeadById(id)
}

/** Belge Okuma sistemi bağlandığında kullanılacak altyapı. */
export async function incrementUsedDocuments(id: number, count = 1): Promise<DemoLead | null> {
  const existing = await getDemoLeadById(id)
  if (!existing) return null

  const nextCount = Math.max(0, (existing.used_documents ?? 0) + count)

  await dbRun(
    `
    UPDATE demo_leads
    SET used_documents = :used_documents, updated_at = datetime('now')
    WHERE id = :id
  `,
    { id, used_documents: nextCount },
  )

  return getDemoLeadById(id)
}

export async function countDemoAccountsByStatus(status: AccountStatus): Promise<number> {
  const row = await dbQueryOne<{ count: number }>(
    'SELECT COUNT(*) as count FROM demo_leads WHERE account_status = :status',
    { status },
  )
  return Number(row?.count ?? 0)
}

export async function countDemoAccountsToday(): Promise<number> {
  const row = await dbQueryOne<{ count: number }>(
    `
      SELECT COUNT(*) as count FROM demo_leads
      WHERE account_status IN ('ACTIVE', 'DISABLED')
        AND date(created_at) = date('now', 'localtime')
    `,
  )
  return Number(row?.count ?? 0)
}

export async function countAllDemoAccounts(): Promise<number> {
  const row = await dbQueryOne<{ count: number }>(
    `SELECT COUNT(*) as count FROM demo_leads WHERE account_status IN ('ACTIVE', 'DISABLED')`,
  )
  return Number(row?.count ?? 0)
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
