import type { NextRequest } from 'next/server'

import { isAdminAuthenticated } from '@/lib/admin-auth'
import { jsonError } from '@/lib/api-response'

function requestHost(request: NextRequest): string | null {
  return request.headers.get('host')?.trim().toLowerCase() ?? null
}

function originHost(request: NextRequest): string | null {
  const origin = request.headers.get('origin')?.trim()
  if (!origin) return null

  try {
    return new URL(origin).host.toLowerCase()
  } catch {
    return null
  }
}

function refererHost(request: NextRequest): string | null {
  const referer = request.headers.get('referer')?.trim()
  if (!referer) return null

  try {
    return new URL(referer).host.toLowerCase()
  } catch {
    return null
  }
}

export async function requireAdminApiAuth(): Promise<Response | null> {
  if (!(await isAdminAuthenticated())) {
    return jsonError('Yetkisiz erişim.', 401)
  }

  return null
}

export function requireSameOriginMutation(request: NextRequest): Response | null {
  const host = requestHost(request)
  if (!host) {
    return jsonError('Yetkisiz istek.', 403)
  }

  const origin = originHost(request)
  if (origin) {
    if (origin !== host) {
      return jsonError('Yetkisiz istek.', 403)
    }
    return null
  }

  const referer = refererHost(request)
  if (referer && referer === host) {
    return null
  }

  return jsonError('Yetkisiz istek.', 403)
}

export async function requireAdminMutationAuth(request: NextRequest): Promise<Response | null> {
  const authError = await requireAdminApiAuth()
  if (authError) {
    return authError
  }

  return requireSameOriginMutation(request)
}
