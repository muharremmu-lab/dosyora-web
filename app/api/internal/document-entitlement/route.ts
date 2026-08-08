export const runtime = 'nodejs'

import type { NextRequest } from 'next/server'

import { jsonError, jsonOk } from '@/lib/api-response'
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

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return jsonError('Yetkisiz erişim.', 401)
  }

  const email = request.nextUrl.searchParams.get('email')?.trim() ?? ''
  if (!email) {
    return jsonError('E-posta zorunludur.', 400)
  }

  const account = await getDemoLeadByEmail(email)
  if (!account || account.lifecycle_status === 'ARCHIVED') {
    return jsonError('Hesap bulunamadı.', 404)
  }

  return jsonOk({
    entitlement: getDocumentEntitlement(account),
    account_type: account.account_type,
    activation_status: account.activation_status,
  })
}
