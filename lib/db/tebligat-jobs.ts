import { randomUUID } from 'node:crypto'

import { dbQueryAll, dbQueryOne, dbRun } from './query'
import { getTebligatCompanyById, type TebligatCompanyRecord } from './tebligat-companies'

export type TebligatJobStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'

export type TebligatJobRecord = {
  id: string
  company_id: string | null
  user_id: string | null
  vkn: string
  company_name: string
  phone: string | null
  whatsapp: string | null
  email: string | null
  query_time: string | null
  job_type: string
  status: TebligatJobStatus
  summary: string | null
  hardware_id: string | null
  created_at: string
  updated_at: string
}

function companySnapshot(company: TebligatCompanyRecord) {
  return {
    company_id: company.id,
    user_id: company.user_id,
    vkn: company.vkn,
    company_name: company.company_name,
    phone: company.phone,
    whatsapp: company.whatsapp,
    email: company.email,
    query_time: company.query_time,
  }
}

export async function createTebligatJob(companyId: string, jobType = 'COMPANY_SCAN'): Promise<TebligatJobRecord | null> {
  const company = await getTebligatCompanyById(companyId)
  if (!company || company.status === 'inactive') return null

  const id = `job_${randomUUID()}`
  const now = new Date().toISOString()
  const snapshot = companySnapshot(company)

  await dbRun(
    'tebligat_jobs.insert',
    `INSERT INTO tebligat_jobs (
      id, company_id, user_id, vkn, company_name, phone, whatsapp, email, query_time,
      job_type, status, summary, hardware_id, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', NULL, NULL, ?, ?)`,
    [
      id,
      snapshot.company_id,
      snapshot.user_id,
      snapshot.vkn,
      snapshot.company_name,
      snapshot.phone,
      snapshot.whatsapp,
      snapshot.email,
      snapshot.query_time,
      jobType,
      now,
      now,
    ],
  )

  return getTebligatJobById(id)
}

export async function getTebligatJobById(id: string): Promise<TebligatJobRecord | null> {
  return dbQueryOne<TebligatJobRecord>(
    'tebligat_jobs.getById',
    'SELECT * FROM tebligat_jobs WHERE id = ?',
    [id],
  )
}

export async function listTebligatJobs(limit = 50): Promise<TebligatJobRecord[]> {
  return dbQueryAll<TebligatJobRecord>(
    'tebligat_jobs.list',
    'SELECT * FROM tebligat_jobs ORDER BY created_at DESC LIMIT ?',
    [limit],
  )
}

export async function pollTebligatJob(hardwareId: string): Promise<TebligatJobRecord | null> {
  const pending = await dbQueryOne<TebligatJobRecord>(
    'tebligat_jobs.poll',
    `SELECT * FROM tebligat_jobs
     WHERE status = 'PENDING'
     ORDER BY created_at ASC
     LIMIT 1`,
  )
  if (!pending) return null

  const now = new Date().toISOString()
  const claimed = await dbRun(
    'tebligat_jobs.claim',
    `UPDATE tebligat_jobs
     SET status = 'RUNNING', hardware_id = ?, updated_at = ?
     WHERE id = ? AND status = 'PENDING'`,
    [hardwareId, now, pending.id],
  )
  if (Number(claimed.rowsAffected) !== 1) return null
  return getTebligatJobById(pending.id)
}

export async function updateTebligatJob(
  id: string,
  hardwareId: string,
  status: 'COMPLETED' | 'FAILED',
  summary: string,
): Promise<TebligatJobRecord | null> {
  const existing = await getTebligatJobById(id)
  if (!existing || existing.hardware_id !== hardwareId) return null

  const now = new Date().toISOString()
  await dbRun(
    'tebligat_jobs.update',
    `UPDATE tebligat_jobs
     SET status = ?, summary = ?, updated_at = ?
     WHERE id = ? AND hardware_id = ?`,
    [status, summary.slice(0, 500), now, id, hardwareId],
  )

  if (status === 'COMPLETED' && existing.company_id) {
    await dbRun(
      'tebligat_jobs.markQueried',
      'UPDATE tebligat_companies SET last_query_at = ?, updated_at = ? WHERE id = ?',
      [now, now, existing.company_id],
    )
  }

  return getTebligatJobById(id)
}

export function jobCompanyPayload(job: TebligatJobRecord) {
  return {
    company_name: job.company_name,
    vkn: job.vkn,
    phone: job.phone,
    whatsapp: job.whatsapp,
    email: job.email,
    query_time: job.query_time,
    status: 'active',
  }
}
