import type { NextRequest } from 'next/server'

import { safeEqual } from '@/lib/admin-auth'

export function readWorkerKey(request: NextRequest): string {
  return request.headers.get('x-worker-key')?.trim() ?? ''
}

export function readHardwareId(request: NextRequest): string {
  return request.headers.get('x-hardware-id')?.trim() ?? ''
}

export function isWorkerAuthorized(request: NextRequest): boolean {
  const expected = process.env.WORKER_API_KEY?.trim() ?? ''
  if (!expected) return false
  return safeEqual(readWorkerKey(request), expected)
}

export function isHardwareId(value: string): boolean {
  return /^[A-Fa-f0-9]{32,128}$/.test(value)
}
