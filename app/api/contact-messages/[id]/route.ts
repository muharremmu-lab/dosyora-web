export const runtime = 'nodejs'

import type { NextRequest } from 'next/server'

import { logApiError, logApiWarning } from '@/lib/api-logger'
import { jsonError, jsonOk } from '@/lib/api-response'
import { getContactMessageById, updateContactMessage } from '@/lib/db/contact-messages'
import { CONTACT_MESSAGE_STATUSES, type ContactMessageStatus } from '@/lib/db/types'

type RouteContext = {
  params: Promise<{ id: string }>
}

function parseId(rawId: string): number | null {
  const id = Number.parseInt(rawId, 10)
  return Number.isFinite(id) && id > 0 ? id : null
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id: rawId } = await context.params
    const id = parseId(rawId)

    if (!id) {
      return jsonError('Geçersiz kayıt.', 400)
    }

    const message = getContactMessageById(id)
    if (!message) {
      return jsonError('Kayıt bulunamadı.', 404)
    }

    return jsonOk({ message })
  } catch (error) {
    logApiError('contact_message_get_failed', {}, error)
    return jsonError('Sunucu hatası.', 500)
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id: rawId } = await context.params
    const id = parseId(rawId)

    if (!id) {
      return jsonError('Geçersiz kayıt.', 400)
    }

    const body = (await request.json()) as Record<string, unknown>
    const status = body.status ? String(body.status) : undefined

    if (status && !CONTACT_MESSAGE_STATUSES.includes(status as ContactMessageStatus)) {
      logApiWarning('contact_message_patch_invalid_status', { id, status })
      return jsonError('Geçersiz durum.', 400)
    }

    const message = updateContactMessage(id, {
      status: status as ContactMessageStatus | undefined,
      notes: body.notes !== undefined ? String(body.notes) : undefined,
    })

    if (!message) {
      return jsonError('Kayıt bulunamadı.', 404)
    }

    return jsonOk({ message })
  } catch (error) {
    logApiError('contact_message_patch_failed', {}, error)
    return jsonError('Sunucu hatası.', 500)
  }
}
