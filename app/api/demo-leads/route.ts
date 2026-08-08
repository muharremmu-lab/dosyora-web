export const runtime = 'nodejs'

import type { NextRequest } from 'next/server'

import { requireAdminApiAuth } from '@/lib/admin-api-auth'
import { parseAccountStatus, parsePositiveInt } from '@/lib/admin/query'
import { logApiInfo, logApiWarning } from '@/lib/api-logger'
import { logDbRouteError } from '@/lib/db/libsql-log'
import { jsonError, jsonOk } from '@/lib/api-response'
import { buildDemoRequestContext } from '@/lib/demo-policy/context'
import { processDemoRequest } from '@/lib/demo-policy/service'
import { listDemoLeads } from '@/lib/db/demo-leads'
import { FORM_RATE_LIMIT, checkRateLimit } from '@/lib/rate-limit'
import { getRequestMeta } from '@/lib/request-meta'
import { validateDemoLeadPayload } from '@/lib/validation/demo-lead'

export async function POST(request: NextRequest) {
  try {
    const meta = getRequestMeta(request)
    const rateLimit = checkRateLimit(`demo-leads:${meta.ip_address}`, FORM_RATE_LIMIT)

    if (!rateLimit.allowed) {
      logApiWarning('demo_failed_rate_limited', { ip: meta.ip_address })
      return jsonError('Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.', 429)
    }

    const body = await request.json()
    const validation = validateDemoLeadPayload(body)

    if (!validation.success) {
      logApiWarning('demo_failed_validation', {
        ip: meta.ip_address,
        errors: validation.errors,
      })
      return jsonError('Doğrulama hatası.', 400, validation.errors)
    }

    const context = buildDemoRequestContext({
      email: validation.data.email,
      ipAddress: meta.ip_address,
      userAgent: meta.user_agent,
      phone: validation.data.phone,
    })

    const result = await processDemoRequest(
      {
        ...validation.data,
        ...meta,
      },
      context,
    )

    if (result.outcome !== 'created') {
      logApiWarning('demo_failed', {
        ip: meta.ip_address,
        email: validation.data.email,
        outcome: result.outcome,
      })
      return jsonError(result.message, result.status)
    }

    logApiInfo('demo_success', {
      ip: meta.ip_address,
      email: result.lead.email,
      leadId: result.lead.id,
      documentLimit: result.documentLimit,
    })

    return jsonOk(
      {
        lead: result.lead,
        document_limit: result.documentLimit,
      },
      { status: 201 },
    )
  } catch (error) {
    logDbRouteError('demo_failed_server', error, { route: 'POST /api/demo-leads' })
    return jsonError('Sunucu hatası.', 500)
  }
}

export async function GET(request: NextRequest) {
  const authError = await requireAdminApiAuth()
  if (authError) {
    return authError
  }

  try {
    const { searchParams } = request.nextUrl
    const page = parsePositiveInt(searchParams.get('page'), 1)
    const limit = parsePositiveInt(searchParams.get('limit'), 20)
    const search = searchParams.get('search') ?? undefined
    const accountStatus = parseAccountStatus(searchParams.get('status'))
    const source = searchParams.get('source') ?? undefined

    const result = await listDemoLeads({ page, limit, search, accountStatus, source })
    return jsonOk(result)
  } catch (error) {
    logDbRouteError('demo_leads_list_failed', error, { route: 'GET /api/demo-leads' })
    return jsonError('Sunucu hatası.', 500)
  }
}
