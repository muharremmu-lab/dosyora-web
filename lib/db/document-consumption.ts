import { DEMO_DOCUMENT_LIMIT } from '@/lib/entitlements/constants'
import type { AccountType } from '@/lib/entitlements/constants'

import { dbInsertReturningId, dbQueryOne, dbRun } from './query'

export type DocumentConsumptionEvent = {
  id: number
  demo_lead_id: number
  document_ref: string
  consumed_at: string
  status: string
}

type QuotaAccount = {
  id: number
  account_type: AccountType | null
  document_limit: number | null
  used_documents: number
}

function resolveEffectiveLimit(account: QuotaAccount): number | null {
  if (account.account_type === 'OWNER' || account.account_type === 'INTERNAL') {
    return null
  }
  if (account.account_type === 'DEMO') {
    return account.document_limit ?? DEMO_DOCUMENT_LIMIT
  }
  return account.document_limit
}

function isUnlimitedAccount(account: QuotaAccount): boolean {
  return account.account_type === 'OWNER' || account.account_type === 'INTERNAL'
}

async function findConsumptionEvent(documentRef: string): Promise<DocumentConsumptionEvent | null> {
  return dbQueryOne<DocumentConsumptionEvent>(
    'documentConsumption.lookup',
    'SELECT * FROM document_consumption_events WHERE document_ref = ?',
    [documentRef],
  )
}

export async function reserveDocumentQuota(input: {
  account: QuotaAccount
  documentRef: string
}): Promise<{ reserved: boolean; duplicate: boolean; blocked: boolean }> {
  if (isUnlimitedAccount(input.account)) {
    return { reserved: true, duplicate: false, blocked: false }
  }

  const effectiveLimit = resolveEffectiveLimit(input.account)
  if (effectiveLimit == null) {
    return { reserved: true, duplicate: false, blocked: false }
  }

  const existing = await findConsumptionEvent(input.documentRef)
  if (existing) {
    return { reserved: true, duplicate: true, blocked: false }
  }

  if (input.account.used_documents >= effectiveLimit) {
    return { reserved: false, duplicate: false, blocked: true }
  }

  try {
    await dbInsertReturningId(
      'documentConsumption.reserve',
      `
      INSERT INTO document_consumption_events (demo_lead_id, document_ref, consumed_at, status)
      VALUES (?, ?, datetime('now'), 'RESERVED')
      RETURNING id
    `,
      [input.account.id, input.documentRef],
    )
  } catch {
    return { reserved: true, duplicate: true, blocked: false }
  }

  const updated = await dbQueryOne<{ used_documents: number }>(
    'documentConsumption.reserveIncrement',
    `
    UPDATE demo_leads
    SET used_documents = used_documents + 1, updated_at = datetime('now')
    WHERE id = ? AND used_documents < ?
    RETURNING used_documents
  `,
    [input.account.id, effectiveLimit],
  )

  if (!updated) {
    await dbRun(
      'documentConsumption.releaseReserved',
      `DELETE FROM document_consumption_events WHERE document_ref = ? AND status = 'RESERVED'`,
      [input.documentRef],
    )
    return { reserved: false, duplicate: false, blocked: true }
  }

  return { reserved: true, duplicate: false, blocked: false }
}

export async function confirmDocumentQuota(input: {
  documentRef: string
}): Promise<{ confirmed: boolean; duplicate: boolean }> {
  const existing = await findConsumptionEvent(input.documentRef)
  if (!existing) {
    return { confirmed: false, duplicate: false }
  }

  if (existing.status === 'CONSUMED') {
    return { confirmed: true, duplicate: true }
  }

  await dbRun(
    'documentConsumption.confirm',
    `
    UPDATE document_consumption_events
    SET status = 'CONSUMED', consumed_at = datetime('now')
    WHERE document_ref = ? AND status = 'RESERVED'
  `,
    [input.documentRef],
  )

  return { confirmed: true, duplicate: false }
}

export async function releaseDocumentQuota(input: {
  account: QuotaAccount
  documentRef: string
}): Promise<{ released: boolean }> {
  if (isUnlimitedAccount(input.account)) {
    return { released: false }
  }

  const existing = await findConsumptionEvent(input.documentRef)
  if (!existing || existing.status !== 'RESERVED') {
    return { released: false }
  }

  await dbRun(
    'documentConsumption.release',
    `DELETE FROM document_consumption_events WHERE document_ref = ? AND status = 'RESERVED'`,
    [input.documentRef],
  )

  await dbRun(
    'documentConsumption.releaseDecrement',
    `
    UPDATE demo_leads
    SET used_documents = CASE
      WHEN used_documents > 0 THEN used_documents - 1
      ELSE 0
    END,
    updated_at = datetime('now')
    WHERE id = ?
  `,
    [input.account.id],
  )

  return { released: true }
}

export async function consumeDocumentQuota(input: {
  documentRef: string
  account: QuotaAccount
}): Promise<{ consumed: boolean; duplicate: boolean; blocked: boolean }> {
  const reserve = await reserveDocumentQuota({
    account: input.account,
    documentRef: input.documentRef,
  })

  if (reserve.blocked) {
    return { consumed: false, duplicate: false, blocked: true }
  }

  if (reserve.duplicate) {
    return { consumed: false, duplicate: true, blocked: false }
  }

  await confirmDocumentQuota({ documentRef: input.documentRef })
  return { consumed: true, duplicate: false, blocked: false }
}
