import { dbInsertReturningId, dbQueryAll, dbQueryOne, dbRun } from './query'
import type { CreateSiteFeedbackInput, FeedbackStatus, SiteFeedback } from './types'

export async function createSiteFeedback(input: CreateSiteFeedbackInput): Promise<SiteFeedback> {
  const now = new Date().toISOString()
  const id = await dbInsertReturningId(
    'createSiteFeedback',
    `INSERT INTO site_feedback (
      created_at, updated_at, kind, contact_name, contact_email, contact_phone, message, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'NEW')
    RETURNING id`,
    [now, now, input.kind, input.contact_name, input.contact_email, input.contact_phone, input.message],
  )
  return (await getSiteFeedbackById(id))!
}

export async function getSiteFeedbackById(id: number): Promise<SiteFeedback | null> {
  return dbQueryOne<SiteFeedback>('getSiteFeedbackById', 'SELECT * FROM site_feedback WHERE id = ?', [id])
}

export async function listSiteFeedback(limit = 100): Promise<SiteFeedback[]> {
  return dbQueryAll<SiteFeedback>(
    'listSiteFeedback',
    `SELECT id, created_at, updated_at, kind, contact_name, contact_email, contact_phone, message, status
     FROM site_feedback
     ORDER BY created_at DESC
     LIMIT ?`,
    [limit],
  )
}

export async function updateSiteFeedbackStatus(id: number, status: FeedbackStatus): Promise<SiteFeedback | null> {
  await dbRun(
    'updateSiteFeedbackStatus',
    'UPDATE site_feedback SET status = ?, updated_at = ? WHERE id = ?',
    [status, new Date().toISOString(), id],
  )
  return getSiteFeedbackById(id)
}
