export const runtime = 'nodejs'

import type { NextRequest } from 'next/server'

import { completeDemoActivation } from '@/lib/activation/service'
import { logApiError } from '@/lib/api-logger'
import { jsonError, jsonOk } from '@/lib/api-response'
import { getCustomerLoginUrl } from '@/lib/customer-portal'

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { token?: string; password?: string }
    const token = String(body.token ?? '')
    const password = String(body.password ?? '')

    const result = await completeDemoActivation({ token, password })

    if (!result.success) {
      return jsonError(result.reason, 400)
    }

    return jsonOk({
      success: true,
      login_url: getCustomerLoginUrl(),
      email: result.lead.email,
    })
  } catch (error) {
    logApiError('demo_activation_complete_failed', {}, error)
    return jsonError('Sunucu hatası.', 500)
  }
}
