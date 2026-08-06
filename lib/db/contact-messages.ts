import { dbInsert, dbRun, dbQueryAll, dbQueryOne } from './query'
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
  const id = await dbInsert(
    `
    INSERT INTO contact_messages (
      name,
      email,
      phone,
      subject,
      message,
      ip_address,
      user_agent
    ) VALUES (
      :name,
      :email,
      :phone,
      :subject,
      :message,
      :ip_address,
      :user_agent
    )
  `,
    {
      name: input.name,
      email: input.email,
      phone: input.phone ?? null,
      subject: input.subject,
      message: input.message,
      ip_address: input.ip_address ?? null,
      user_agent: input.user_agent ?? null,
    },
  )

  return (await getContactMessageById(id))!
}

export async function getContactMessageById(id: number): Promise<ContactMessage | null> {
  const row = await dbQueryOne<ContactMessageRow>(
    'SELECT * FROM contact_messages WHERE id = :id',
    { id },
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
  const params: Record<string, string | number> = {}

  if (options.search) {
    conditions.push(
      `(name LIKE :search OR email LIKE :search OR phone LIKE :search OR subject LIKE :search)`,
    )
    params.search = `%${options.search}%`
  }

  if (options.status) {
    conditions.push('status = :status')
    params.status = options.status
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  const totalRow = await dbQueryOne<{ count: number }>(
    `SELECT COUNT(*) as count FROM contact_messages ${whereClause}`,
    params,
  )

  const rows = await dbQueryAll<ContactMessageRow>(
    `SELECT * FROM contact_messages ${whereClause} ORDER BY created_at DESC LIMIT :limit OFFSET :offset`,
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

export async function updateContactMessage(
  id: number,
  input: UpdateContactMessageInput,
): Promise<ContactMessage | null> {
  const existing = await getContactMessageById(id)
  if (!existing) return null

  await dbRun(
    `
    UPDATE contact_messages
    SET
      status = :status,
      notes = :notes
    WHERE id = :id
  `,
    {
      id,
      status: input.status ?? existing.status,
      notes: input.notes !== undefined ? input.notes : existing.notes,
    },
  )

  return getContactMessageById(id)
}

export async function countAllContactMessages(): Promise<number> {
  const row = await dbQueryOne<{ count: number }>(
    'SELECT COUNT(*) as count FROM contact_messages',
  )
  return Number(row?.count ?? 0)
}

export async function countContactMessagesByStatus(status: ContactMessageStatus): Promise<number> {
  const row = await dbQueryOne<{ count: number }>(
    'SELECT COUNT(*) as count FROM contact_messages WHERE status = :status',
    { status },
  )
  return Number(row?.count ?? 0)
}
