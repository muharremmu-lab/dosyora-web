export const runtime = 'nodejs'

import type { NextRequest } from 'next/server'

import { logApiWarning } from '@/lib/api-logger'
import { jsonError, jsonOk } from '@/lib/api-response'
import { consumeDocumentQuota } from '@/lib/db/document-consumption'
import { getDemoLeadByEmail } from '@/lib/db/demo-leads'
import { getDocumentEntitlement } from '@/lib/entitlements/policy'
import { getBelgeOkumaInternalSecret } from '@/lib/provisioning/types'

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
  }

  const email = String(body.email ?? '').trim()
  const documentRef = String(body.document_ref ?? '').trim()

  if (!email || !documentRef) {
    return jsonError('E-posta ve document_ref zorunludur.', 400)
  }

  const account = await getDemoLeadByEmail(email)
  if (!account || account.lifecycle_status === 'ARCHIVED') {
    return jsonError('Hesap bulunamadı.', 404)
  }

  const entitlement = getDocumentEntitlement(account)
  if (!entitlement.canProcess) {
    logApiWarning('document_quota_blocked', { email, documentRef })
    return jsonError('Belge kotası dolmuş.', 403)
  }

  const consumption = await consumeDocumentQuota({
    demoLeadId: account.id,
    documentRef,
  })

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
