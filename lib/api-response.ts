import { NextResponse } from 'next/server'

import type { ValidationError } from '@/lib/validation/common'

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init)
}

export function jsonError(message: string, status: number, errors?: ValidationError[]) {
  return NextResponse.json({ error: message, errors }, { status })
}
