import { dbInsertReturningId, dbQueryAll, dbQueryOne, dbRun } from './query'
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

export async function createContactMessage(
  input: CreateContactMessageInput,
): Promise<ContactMessage> {
  const id = await dbInsertReturningId(
    'createContactMessage',
    `
    INSERT INTO contact_messages (
      name,
      email,
      phone,
      subject,
      message,
      ip_address,
      user_agent
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
    RETURNING id
  `,
    [
      input.name,
      input.email,
      input.phone ?? null,
      input.subject,
      input.message,
      input.ip_address ?? null,
      input.user_agent ?? null,
    ],
  )

  return (await getContactMessageById(id))!
}

export async function getContactMessageById(id: number): Promise<ContactMessage | null> {
  const row = await dbQueryOne<ContactMessageRow>(
    'getContactMessageById',
    'SELECT * FROM contact_messages WHERE id = ?',
    [id],
  )
  return row ? mapRow(row) : null
}

export async function listContactMessages(
  options: ListContactMessagesOptions = {},
): Promise<PaginatedResult<ContactMessage>> {
  const page = Math.max(1, options.page ?? 1)
  const limit = Math.min(100, Math.max(1, options.limit ?? 20))
  const offset = (page - 1) * limit

  const conditions: string[] = []
  const params: Array<string | number> = []

  if (options.search) {
    conditions.push('(name LIKE ? OR email LIKE ? OR phone LIKE ? OR subject LIKE ?)')
    const search = `%${options.search}%`
    params.push(search, search, search, search)
  }

  if (options.status) {
    conditions.push('status = ?')
    params.push(options.status)
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  const totalRow = await dbQueryOne<{ count: number }>(
    'listContactMessages.count',
    `SELECT COUNT(*) as count FROM contact_messages ${whereClause}`,
    params,
  )

  const rows = await dbQueryAll<ContactMessageRow>(
    'listContactMessages.items',
    `SELECT * FROM contact_messages ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
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

export async function updateContactMessage(
  id: number,
  input: UpdateContactMessageInput,
): Promise<ContactMessage | null> {
  const existing = await getContactMessageById(id)
  if (!existing) return null

  await dbRun(
    'updateContactMessage',
    `
    UPDATE contact_messages
    SET
      status = ?,
      notes = ?
    WHERE id = ?
  `,
    [input.status ?? existing.status, input.notes !== undefined ? input.notes : existing.notes, id],
  )

  return getContactMessageById(id)
}

export async function countAllContactMessages(): Promise<number> {
  const row = await dbQueryOne<{ count: number }>(
    'countAllContactMessages',
    'SELECT COUNT(*) as count FROM contact_messages',
  )
  return Number(row?.count ?? 0)
}

export async function countContactMessagesByStatus(status: ContactMessageStatus): Promise<number> {
  const row = await dbQueryOne<{ count: number }>(
    'countContactMessagesByStatus',
    'SELECT COUNT(*) as count FROM contact_messages WHERE status = ?',
    [status],
  )
  return Number(row?.count ?? 0)
}
