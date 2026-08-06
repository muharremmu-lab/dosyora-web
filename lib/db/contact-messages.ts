import { getDb } from './client'
import type {
  ContactMessage,
  ContactMessageStatus,
  CreateContactMessageInput,
  PaginatedResult,
  UpdateContactMessageInput,
} from './types'

type ContactMessageRow = ContactMessage

type ListContactMessagesOptions = {
  page?: number
  limit?: number
  search?: string
  status?: ContactMessageStatus
}

function mapRow(row: ContactMessageRow): ContactMessage {
  return row
}

export function createContactMessage(input: CreateContactMessageInput): ContactMessage {
  const db = getDb()
  const stmt = db.prepare(`
    INSERT INTO contact_messages (
      name,
      email,
      phone,
      subject,
      message,
      ip_address,
      user_agent
    ) VALUES (
      @name,
      @email,
      @phone,
      @subject,
      @message,
      @ip_address,
      @user_agent
    )
  `)

  const result = stmt.run({
    name: input.name,
    email: input.email,
    phone: input.phone ?? null,
    subject: input.subject,
    message: input.message,
    ip_address: input.ip_address ?? null,
    user_agent: input.user_agent ?? null,
  })

  return getContactMessageById(Number(result.lastInsertRowid))!
}

export function getContactMessageById(id: number): ContactMessage | null {
  const db = getDb()
  const row = db
    .prepare('SELECT * FROM contact_messages WHERE id = ?')
    .get(id) as ContactMessageRow | undefined
  return row ? mapRow(row) : null
}

export function listContactMessages(
  options: ListContactMessagesOptions = {},
): PaginatedResult<ContactMessage> {
  const page = Math.max(1, options.page ?? 1)
  const limit = Math.min(100, Math.max(1, options.limit ?? 20))
  const offset = (page - 1) * limit

  const conditions: string[] = []
  const params: Record<string, string> = {}

  if (options.search) {
    conditions.push(
      `(name LIKE @search OR email LIKE @search OR phone LIKE @search OR subject LIKE @search)`,
    )
    params.search = `%${options.search}%`
  }

  if (options.status) {
    conditions.push('status = @status')
    params.status = options.status
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
  const db = getDb()

  const totalRow = db
    .prepare(`SELECT COUNT(*) as count FROM contact_messages ${whereClause}`)
    .get(params) as { count: number }

  const rows = db
    .prepare(
      `SELECT * FROM contact_messages ${whereClause} ORDER BY created_at DESC LIMIT @limit OFFSET @offset`,
    )
    .all({ ...params, limit: String(limit), offset: String(offset) }) as ContactMessageRow[]

  const total = totalRow.count

  return {
    items: rows.map(mapRow),
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  }
}

export function updateContactMessage(
  id: number,
  input: UpdateContactMessageInput,
): ContactMessage | null {
  const existing = getContactMessageById(id)
  if (!existing) return null

  const db = getDb()
  db.prepare(
    `
    UPDATE contact_messages
    SET
      status = @status,
      notes = @notes
    WHERE id = @id
  `,
  ).run({
    id,
    status: input.status ?? existing.status,
    notes: input.notes !== undefined ? input.notes : existing.notes,
  })

  return getContactMessageById(id)
}

export function countAllContactMessages(): number {
  const db = getDb()
  const row = db.prepare('SELECT COUNT(*) as count FROM contact_messages').get() as { count: number }
  return row.count
}

export function countContactMessagesByStatus(status: ContactMessageStatus): number {
  const db = getDb()
  const row = db
    .prepare('SELECT COUNT(*) as count FROM contact_messages WHERE status = ?')
    .get(status) as { count: number }
  return row.count
}
