import { NextResponse, type NextRequest } from 'next/server'

import { requireAdminApiAuth } from '@/lib/admin-api-auth'
import { jsonError, jsonOk } from '@/lib/api-response'
import { logApiWarning } from '@/lib/api-logger'
import { createSiteFeedback, listSiteFeedback } from '@/lib/db/feedback'
import { logDbRouteError } from '@/lib/db/libsql-log'
import { FORM_RATE_LIMIT, checkRateLimit } from '@/lib/rate-limit'
import { getRequestMeta } from '@/lib/request-meta'
import { validateFeedbackPayload } from '@/lib/validation/feedback'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const meta = getRequestMeta(request)
  const rateLimit = checkRateLimit(`feedback:${meta.ip_address}`, FORM_RATE_LIMIT)
  if (!rateLimit.allowed) {
    return jsonError('Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.', 429)
  }

  const contentType = request.headers.get('content-type') ?? ''
  const wantsJson = contentType.includes('application/json')
  let body: unknown
  try {
    if (wantsJson) {
      body = await request.json()
    } else {
      const form = await request.formData()
      body = {
        kind: form.get('kind'),
        name: form.get('name'),
        email: form.get('email'),
        phone: form.get('phone'),
        message: form.get('message'),
      }
    }
  } catch {
    return jsonError('Geçersiz istek gövdesi.', 400)
  }

  const validation = validateFeedbackPayload(body)
  if (!validation.success) {
    logApiWarning('feedback_invalid', { errors: validation.errors })
    return jsonError('Doğrulama hatası.', 400, validation.errors)
  }

  try {
    const feedback = await createSiteFeedback(validation.data)
    if (!wantsJson) {
      return NextResponse.redirect(new URL('/?bildirim=1#oneri', request.url), 303)
    }
    return jsonOk({ id: feedback.id, createdAt: feedback.created_at }, { status: 201 })
  } catch (error) {
    logDbRouteError('feedback_create_failed', error, { operation: 'createSiteFeedback' })
    return jsonError('Bildirim kaydedilemedi.', 500)
  }
}

export async function GET() {
  const authError = await requireAdminApiAuth()
  if (authError) return authError

  try {
    const items = await listSiteFeedback()
    return jsonOk({ items })
  } catch (error) {
    logDbRouteError('feedback_list_failed', error, { operation: 'listSiteFeedback' })
    return jsonError('Bildirimler okunamadı.', 500)
  }
}
