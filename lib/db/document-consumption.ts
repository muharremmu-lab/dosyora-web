import { dbInsertReturningId, dbQueryOne, dbRun } from './query'

export type DocumentConsumptionEvent = {
  id: number
  demo_lead_id: number
  document_ref: string
  consumed_at: string
  status: string
}

export async function consumeDocumentQuota(input: {
  demoLeadId: number
  documentRef: string
}): Promise<{ consumed: boolean; duplicate: boolean }> {
  const existing = await dbQueryOne<DocumentConsumptionEvent>(
    'consumeDocumentQuota.lookup',
    'SELECT * FROM document_consumption_events WHERE document_ref = ?',
    [input.documentRef],
  )

  if (existing) {
    return { consumed: false, duplicate: true }
  }

  try {
    await dbInsertReturningId(
      'consumeDocumentQuota.insert',
      `
      INSERT INTO document_consumption_events (demo_lead_id, document_ref, consumed_at, status)
      VALUES (?, ?, datetime('now'), 'CONSUMED')
      RETURNING id
    `,
      [input.demoLeadId, input.documentRef],
    )
  } catch {
    return { consumed: false, duplicate: true }
  }

  await dbRun(
    'consumeDocumentQuota.increment',
    `
    UPDATE demo_leads
    SET used_documents = used_documents + 1, updated_at = datetime('now')
    WHERE id = ?
  `,
    [input.demoLeadId],
  )

  return { consumed: true, duplicate: false }
}
