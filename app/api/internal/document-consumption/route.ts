export const runtime = 'nodejs'

import type { NextRequest } from 'next/server'

import { logApiWarning } from '@/lib/api-logger'
import { jsonError, jsonOk } from '@/lib/api-response'
import {
  confirmDocumentQuota,
  consumeDocumentQuota,
  releaseDocumentQuota,
  reserveDocumentQuota,
} from '@/lib/db/document-consumption'
import { getDemoLeadByEmail } from '@/lib/db/demo-leads'
import { getDocumentEntitlement } from '@/lib/entitlements/policy'
import { getBelgeOkumaInternalSecret } from '@/lib/provisioning/types'

type ConsumptionAction = 'consume' | 'reserve' | 'confirm' | 'release'

function isAuthorized(request: NextRequest): boolean {
  const secret = getBelgeOkumaInternalSecret()
  if (!secret) {
    return false
  }

  const authHeader = request.headers.get('authorization')
  return authHeader === `Bearer ${secret}`
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return jsonError('Yetkisiz erişim.', 401)
  }

  const body = (await request.json()) as {
    email?: string
    document_ref?: string
    action?: ConsumptionAction
  }

  const email = String(body.email ?? '').trim()
  const documentRef = String(body.document_ref ?? '').trim()
  const action: ConsumptionAction = body.action ?? 'consume'

  if (!email || !documentRef) {
    return jsonError('E-posta ve document_ref zorunludur.', 400)
  }

  const account = await getDemoLeadByEmail(email)
  if (!account || account.lifecycle_status === 'ARCHIVED') {
    return jsonError('Hesap bulunamadı.', 404)
  }

  const entitlement = getDocumentEntitlement(account)

  if (action === 'reserve') {
    if (!entitlement.canProcess && !entitlement.unlimited) {
      logApiWarning('document_quota_blocked', { email, documentRef, action })
      return jsonError('Belge kotası dolmuş.', 403)
    }

    const reservation = await reserveDocumentQuota({ account, documentRef })
    if (reservation.blocked) {
      return jsonError('Belge kotası dolmuş.', 403)
    }

    const updated = await getDemoLeadByEmail(email)
    return jsonOk({
      reserved: reservation.reserved,
      duplicate: reservation.duplicate,
      entitlement: updated ? getDocumentEntitlement(updated) : entitlement,
    })
  }

  if (action === 'confirm') {
    const confirmation = await confirmDocumentQuota({ documentRef })
    const updated = await getDemoLeadByEmail(email)
    return jsonOk({
      confirmed: confirmation.confirmed,
      duplicate: confirmation.duplicate,
      entitlement: updated ? getDocumentEntitlement(updated) : entitlement,
    })
  }

  if (action === 'release') {
    await releaseDocumentQuota({ account, documentRef })
    const updated = await getDemoLeadByEmail(email)
    return jsonOk({
      released: true,
      entitlement: updated ? getDocumentEntitlement(updated) : entitlement,
    })
  }

  if (!entitlement.canProcess) {
    logApiWarning('document_quota_blocked', { email, documentRef, action: 'consume' })
    return jsonError('Belge kotası dolmuş.', 403)
  }

  const consumption = await consumeDocumentQuota({
    documentRef,
    account,
  })

  if (consumption.blocked) {
    return jsonError('Belge kotası dolmuş.', 403)
  }

  if (consumption.duplicate) {
    return jsonOk({
      consumed: false,
      duplicate: true,
      entitlement: getDocumentEntitlement({
        ...account,
        used_documents: account.used_documents,
      }),
    })
  }

  const updated = await getDemoLeadByEmail(email)
  return jsonOk({
    consumed: consumption.consumed,
    duplicate: false,
    entitlement: updated ? getDocumentEntitlement(updated) : entitlement,
  })
}
