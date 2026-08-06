import { getDb } from './client'
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
  return row
}

export function findDemoAccountByEmail(email: string): DemoLead | null {
  const db = getDb()
  const row = db
    .prepare(
      `
      SELECT * FROM demo_leads
      WHERE lower(email) = lower(?)
        AND account_status IN ('ACTIVE', 'DISABLED')
      ORDER BY created_at ASC
      LIMIT 1
    `,
    )
    .get(email) as DemoLeadRow | undefined

  return row ? mapRow(row) : null
}

export function createDemoAccount(input: CreateDemoAccountInput): DemoLead {
  const db = getDb()
  const stmt = db.prepare(`
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
      status
    ) VALUES (
      @company_name,
      @contact_name,
      @email,
      @phone,
      @city,
      @employee_count,
      @monthly_document_count,
      @message,
      @source,
      @ip_address,
      @user_agent,
      @document_limit,
      'ACTIVE',
      'NEW'
    )
  `)

  const result = stmt.run({
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
  })

  return getDemoLeadById(Number(result.lastInsertRowid))!
}

/** @deprecated Use createDemoAccount via demo policy service */
export function createDemoLead(input: CreateDemoLeadInput): DemoLead {
  return createDemoAccount({
    ...input,
    document_limit: 100,
  })
}

export function getDemoLeadById(id: number): DemoLead | null {
  const db = getDb()
  const row = db.prepare('SELECT * FROM demo_leads WHERE id = ?').get(id) as DemoLeadRow | undefined
  return row ? mapRow(row) : null
}

export function listDemoLeads(options: ListDemoLeadsOptions = {}): PaginatedResult<DemoLead> {
  const page = Math.max(1, options.page ?? 1)
  const limit = Math.min(100, Math.max(1, options.limit ?? 20))
  const offset = (page - 1) * limit

  const conditions: string[] = ["account_status IN ('ACTIVE', 'DISABLED')"]
  const params: Record<string, string> = {}

  if (options.search) {
    conditions.push(
      `(company_name LIKE @search OR contact_name LIKE @search OR email LIKE @search OR phone LIKE @search)`,
    )
    params.search = `%${options.search}%`
  }

  if (options.accountStatus) {
    conditions.push('account_status = @account_status')
    params.account_status = options.accountStatus
  }

  if (options.source) {
    conditions.push('source = @source')
    params.source = options.source
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`
  const db = getDb()

  const totalRow = db
    .prepare(`SELECT COUNT(*) as count FROM demo_leads ${whereClause}`)
    .get(params) as { count: number }

  const rows = db
    .prepare(
      `SELECT * FROM demo_leads ${whereClause} ORDER BY created_at DESC LIMIT @limit OFFSET @offset`,
    )
    .all({ ...params, limit: String(limit), offset: String(offset) }) as DemoLeadRow[]

  const total = totalRow.count

  return {
    items: rows.map(mapRow),
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  }
}

export function updateDemoLead(id: number, input: UpdateDemoLeadInput): DemoLead | null {
  const existing = getDemoLeadById(id)
  if (!existing) return null

  const db = getDb()
  db.prepare(
    `
    UPDATE demo_leads
    SET
      document_limit = @document_limit,
      account_status = @account_status,
      updated_at = datetime('now')
    WHERE id = @id
  `,
  ).run({
    id,
    document_limit:
      input.document_limit !== undefined ? input.document_limit : existing.document_limit,
    account_status:
      input.account_status !== undefined ? input.account_status : existing.account_status,
  })

  return getDemoLeadById(id)
}

export function countDemoAccountsByStatus(status: AccountStatus): number {
  const db = getDb()
  const row = db
    .prepare('SELECT COUNT(*) as count FROM demo_leads WHERE account_status = ?')
    .get(status) as { count: number }
  return row.count
}

export function countDemoAccountsToday(): number {
  const db = getDb()
  const row = db
    .prepare(
      `
      SELECT COUNT(*) as count FROM demo_leads
      WHERE account_status IN ('ACTIVE', 'DISABLED')
        AND date(created_at) = date('now', 'localtime')
    `,
    )
    .get() as { count: number }
  return row.count
}

export function countAllDemoAccounts(): number {
  const db = getDb()
  const row = db
    .prepare(
      `SELECT COUNT(*) as count FROM demo_leads WHERE account_status IN ('ACTIVE', 'DISABLED')`,
    )
    .get() as { count: number }
  return row.count
}

/** @deprecated */
export function countDemoLeadsByStatus(status: AccountStatus): number {
  return countDemoAccountsByStatus(status)
}

/** @deprecated */
export function countDemoLeadsToday(): number {
  return countDemoAccountsToday()
}

/** @deprecated */
export function countAllDemoLeads(): number {
  return countAllDemoAccounts()
}
