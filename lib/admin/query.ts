import { ACCOUNT_STATUSES, type AccountStatus } from '@/lib/db/types'
import { CONTACT_MESSAGE_STATUSES, type ContactMessageStatus } from '@/lib/db/types'

export function parseAccountStatus(value: string | null): AccountStatus | undefined {
  if (!value) return undefined
  return ACCOUNT_STATUSES.includes(value as AccountStatus) ? (value as AccountStatus) : undefined
}

/** @deprecated Use parseAccountStatus */
export function parseLeadStatus(value: string | null): AccountStatus | undefined {
  return parseAccountStatus(value)
}

export function parseContactMessageStatus(
  value: string | null,
): ContactMessageStatus | undefined {
  if (!value) return undefined
  return CONTACT_MESSAGE_STATUSES.includes(value as ContactMessageStatus)
    ? (value as ContactMessageStatus)
    : undefined
}

export function parsePositiveInt(value: string | null, fallback: number): number {
  if (!value) return fallback
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}
