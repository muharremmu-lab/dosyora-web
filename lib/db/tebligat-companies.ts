import { randomUUID } from 'node:crypto'
import type { InArgs } from '@libsql/client'

import { dbQueryAll, dbQueryOne, dbRun } from './query'

export type TebligatCompanyRecord = {
  id: string
  user_id: string | null
  company_name: string
  vkn: string
  authorized_person: string | null
  phone: string | null
  whatsapp: string | null
  email: string | null
  query_time: string
  status: 'active' | 'inactive' | 'error'
  last_query_at: string | null
  created_at: string
  updated_at: string
}

export type CreateTebligatCompanyInput = {
  user_id?: string | null
  company_name: string
  vkn: string
  authorized_person?: string | null
  phone?: string | null
  whatsapp?: string | null
  email?: string | null
  query_time?: string
  status?: 'active' | 'inactive' | 'error'
}

export type UpdateTebligatCompanyInput = Partial<Omit<CreateTebligatCompanyInput, 'user_id'>>

export async function listTebligatCompanies(params?: {
  userId?: string | null
  status?: string
  search?: string
}): Promise<TebligatCompanyRecord[]> {
  const conditions: string[] = []
  const args: unknown[] = []

  if (params?.userId) {
    conditions.push('(user_id = ? OR user_id IS NULL)')
    args.push(params.userId)
  }

  if (params?.status) {
    conditions.push('status = ?')
    args.push(params.status)
  }

  if (params?.search) {
    const term = `%${params.search.trim().toLowerCase()}%`
    conditions.push('(LOWER(company_name) LIKE ? OR vkn LIKE ? OR LOWER(authorized_person) LIKE ?)')
    args.push(term, term, term)
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
  return dbQueryAll<TebligatCompanyRecord>(
    'tebligat_companies.list',
    `SELECT * FROM tebligat_companies ${whereClause} ORDER BY created_at DESC`,
    args as InArgs,
  )
}

export async function getTebligatCompanyById(id: string): Promise<TebligatCompanyRecord | null> {
  return dbQueryOne<TebligatCompanyRecord>(
    'tebligat_companies.getById',
    'SELECT * FROM tebligat_companies WHERE id = ?',
    [id],
  )
}

export async function getTebligatCompanyByVkn(vkn: string, userId?: string | null): Promise<TebligatCompanyRecord | null> {
  if (userId) {
    return dbQueryOne<TebligatCompanyRecord>(
      'tebligat_companies.getByVknAndUser',
      'SELECT * FROM tebligat_companies WHERE vkn = ? AND (user_id = ? OR user_id IS NULL) LIMIT 1',
      [vkn, userId],
    )
  }
  return dbQueryOne<TebligatCompanyRecord>(
    'tebligat_companies.getByVkn',
    'SELECT * FROM tebligat_companies WHERE vkn = ? LIMIT 1',
    [vkn],
  )
}

export async function createTebligatCompany(input: CreateTebligatCompanyInput): Promise<TebligatCompanyRecord> {
  const id = `tco_${randomUUID()}`
  const now = new Date().toISOString()
  const status = input.status ?? 'active'
  const queryTime = input.query_time ?? '09:00'

  await dbRun(
    'tebligat_companies.insert',
    `INSERT INTO tebligat_companies (
      id, user_id, company_name, vkn, authorized_person, phone, whatsapp, email, query_time, status, last_query_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?)`,
    [
      id,
      input.user_id ?? null,
      input.company_name.trim(),
      input.vkn.trim(),
      input.authorized_person?.trim() ?? null,
      input.phone?.trim() ?? null,
      input.whatsapp?.trim() ?? null,
      input.email?.trim() ?? null,
      queryTime.trim(),
      status,
      now,
      now,
    ],
  )

  const created = await getTebligatCompanyById(id)
  return created!
}

export async function updateTebligatCompany(
  id: string,
  input: UpdateTebligatCompanyInput,
): Promise<TebligatCompanyRecord | null> {
  const existing = await getTebligatCompanyById(id)
  if (!existing) return null

  const companyName = input.company_name !== undefined ? input.company_name.trim() : existing.company_name
  const vkn = input.vkn !== undefined ? input.vkn.trim() : existing.vkn
  const authorizedPerson = input.authorized_person !== undefined ? input.authorized_person?.trim() ?? null : existing.authorized_person
  const phone = input.phone !== undefined ? input.phone?.trim() ?? null : existing.phone
  const whatsapp = input.whatsapp !== undefined ? input.whatsapp?.trim() ?? null : existing.whatsapp
  const email = input.email !== undefined ? input.email?.trim() ?? null : existing.email
  const queryTime = input.query_time !== undefined ? input.query_time.trim() : existing.query_time
  const status = input.status !== undefined ? input.status : existing.status
  const now = new Date().toISOString()

  await dbRun(
    'tebligat_companies.update',
    `UPDATE tebligat_companies SET
      company_name = ?, vkn = ?, authorized_person = ?, phone = ?, whatsapp = ?, email = ?, query_time = ?, status = ?, updated_at = ?
     WHERE id = ?`,
    [companyName, vkn, authorizedPerson, phone, whatsapp, email, queryTime, status, now, id],
  )

  return getTebligatCompanyById(id)
}

export async function deleteTebligatCompany(id: string): Promise<boolean> {
  const result = await dbRun(
    'tebligat_companies.delete',
    'DELETE FROM tebligat_companies WHERE id = ?',
    [id],
  )
  return (result.rowsAffected ?? 0) > 0
}

export async function triggerTebligatQuery(id: string): Promise<TebligatCompanyRecord | null> {
  const existing = await getTebligatCompanyById(id)
  if (!existing) return null

  const now = new Date().toISOString()
  await dbRun(
    'tebligat_companies.triggerQuery',
    `UPDATE tebligat_companies SET last_query_at = ?, updated_at = ? WHERE id = ?`,
    [now, now, id],
  )

  return getTebligatCompanyById(id)
}
