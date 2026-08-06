import { Badge } from '@/components/ui'
import type { AccountStatus, ContactMessageStatus } from '@/lib/db/types'
import { ACCOUNT_STATUS_LABELS, CONTACT_STATUS_LABELS } from '@/lib/admin/labels'

type StatusBadgeProps =
  | { kind: 'account'; status: AccountStatus }
  | { kind: 'contact'; status: ContactMessageStatus }

function accountVariant(status: AccountStatus) {
  return status === 'ACTIVE' ? 'success' : 'danger'
}

function contactVariant(status: ContactMessageStatus) {
  switch (status) {
    case 'NEW':
      return 'primary'
    case 'REPLIED':
      return 'success'
    case 'ARCHIVED':
      return 'warning'
    default:
      return 'primary'
  }
}

export function StatusBadge(props: StatusBadgeProps) {
  if (props.kind === 'account') {
    return (
      <Badge variant={accountVariant(props.status)}>
        {ACCOUNT_STATUS_LABELS[props.status]}
      </Badge>
    )
  }

  return (
    <Badge variant={contactVariant(props.status)}>
      {CONTACT_STATUS_LABELS[props.status]}
    </Badge>
  )
}
