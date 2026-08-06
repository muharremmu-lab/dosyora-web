import type { AccountStatus, ContactMessageStatus } from '@/lib/db/types'

export const ACCOUNT_STATUS_LABELS: Record<AccountStatus, string> = {
  ACTIVE: 'Aktif',
  DISABLED: 'Devre Dışı',
}

export const CONTACT_STATUS_LABELS: Record<ContactMessageStatus, string> = {
  NEW: 'Yeni',
  READ: 'Okundu',
  REPLIED: 'Yanıtlandı',
  ARCHIVED: 'Arşivlendi',
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}
