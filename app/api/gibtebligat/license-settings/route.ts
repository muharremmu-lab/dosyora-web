export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import type { NextRequest } from 'next/server'

import { requireAdminMutationAuth } from '@/lib/admin-api-auth'
import { jsonError, jsonOk } from '@/lib/api-response'
import { logDbRouteError } from '@/lib/db/libsql-log'
import { getBankSettings, saveBankSettings } from '@/lib/licensing/orders'

function text(value: unknown, max: number): string {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, max)
}

export async function POST(request: NextRequest) {
  const authError = await requireAdminMutationAuth(request)
  if (authError) return authError

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return jsonError('Geçersiz istek gövdesi.', 400)
  }

  if (!body || typeof body !== 'object') {
    return jsonError('Geçersiz istek gövdesi.', 400)
  }

  const record = body as Record<string, unknown>
  const iban = text(record.iban, 42).replace(/\s+/g, '').toUpperCase()
  const accountName = text(record.accountName, 120)
  const notePrefix = text(record.notePrefix, 12).toUpperCase().replace(/[^A-Z0-9]/g, '') || 'GT'

  if (iban && !/^TR\d{24}$/.test(iban)) {
    return jsonError('IBAN TR ile başlamalı ve 26 karakter olmalıdır.', 400)
  }
  if (accountName.length < 2) {
    return jsonError('Alıcı unvanı gerekli.', 400)
  }

  try {
    await saveBankSettings({ iban, accountName, notePrefix })
    return jsonOk(await getBankSettings())
  } catch (error) {
    logDbRouteError('gibtebligat_license_settings_failed', error, { operation: 'saveBankSettings' })
    return jsonError('Banka bilgileri kaydedilemedi.', 500)
  }
}
