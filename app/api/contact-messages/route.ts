export const runtime = 'nodejs'

import type { NextRequest } from 'next/server'

import { logApiError, logApiWarning } from '@/lib/api-logger'
import { jsonError, jsonOk } from '@/lib/api-response'
import { createContactMessage, listContactMessages } from '@/lib/db/contact-messages'
import { notificationService } from '@/lib/notifications/service'
import { FORM_RATE_LIMIT, checkRateLimit } from '@/lib/rate-limit'
import { getRequestMeta } from '@/lib/request-meta'
import { parseContactMessageStatus, parsePositiveInt } from '@/lib/admin/query'
import { validateContactMessagePayload } from '@/lib/validation/contact-message'

export async function POST(request: NextRequest) {
  try {
    const meta = getRequestMeta(request)
    const rateLimit = checkRateLimit(`contact-messages:${meta.ip_address}`, FORM_RATE_LIMIT)

    if (!rateLimit.allowed) {
      logApiWarning('contact_message_rate_limited', { ip: meta.ip_address })
      return jsonError('Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.', 429)
    }

    const body = await request.json()
    const validation = validateContactMessagePayload(body)

    if (!validation.success) {
      logApiWarning('contact_message_validation_failed', {
        ip: meta.ip_address,
        errors: validation.errors,
      })
      return jsonError('Doğrulama hatası.', 400, validation.errors)
    }

    const message = createContactMessage({
      ...validation.data,
      ...meta,
    })

    await notificationService.notifyContactMessageCreated(message)

    return jsonOk({ message }, { status: 201 })
  } catch (error) {
    logApiError('contact_message_create_failed', {}, error)
    return jsonError('Sunucu hatası.', 500)
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const page = parsePositiveInt(searchParams.get('page'), 1)
    const limit = parsePositiveInt(searchParams.get('limit'), 20)
    const search = searchParams.get('search') ?? undefined
    const status = parseContactMessageStatus(searchParams.get('status'))

    const result = listContactMessages({ page, limit, search, status })
    return jsonOk(result)
  } catch (error) {
    logApiError('contact_messages_list_failed', {}, error)
    return jsonError('Sunucu hatası.', 500)
  }
}
