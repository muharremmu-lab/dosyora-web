import { DEMO_DOCUMENT_LIMIT, DEMO_RUNTIME_LIMITS, type AccountType } from './constants'

export type EntitlementAccount = {
  account_type: AccountType | null
  document_limit: number | null
  used_documents: number
}

export type DocumentEntitlement = {
  accountType: AccountType | null
  limit: number | null
  consumed: number
  remaining: number | null
  unlimited: boolean
  canProcess: boolean
}

function isUnlimitedAccountType(accountType: AccountType | null): boolean {
  return accountType === 'OWNER' || accountType === 'INTERNAL'
}

export function getDocumentEntitlement(account: EntitlementAccount): DocumentEntitlement {
  const consumed = Math.max(0, account.used_documents ?? 0)
  const unlimited = isUnlimitedAccountType(account.account_type)

  if (unlimited) {
    return {
      accountType: account.account_type,
      limit: null,
      consumed,
      remaining: null,
      unlimited: true,
      canProcess: true,
    }
  }

  const limit =
    account.account_type === 'DEMO'
      ? account.document_limit ?? DEMO_DOCUMENT_LIMIT
      : account.document_limit

  if (limit == null) {
    return {
      accountType: account.account_type,
      limit: null,
      consumed,
      remaining: null,
      unlimited: false,
      canProcess: true,
    }
  }

  const remaining = Math.max(0, limit - consumed)

  return {
    accountType: account.account_type,
    limit,
    consumed,
    remaining,
    unlimited: false,
    canProcess: remaining > 0,
  }
}

export function getRemainingDocumentQuota(account: EntitlementAccount): number | null {
  return getDocumentEntitlement(account).remaining
}

export function canProcessDocument(account: EntitlementAccount): boolean {
  return getDocumentEntitlement(account).canProcess
}

export function resolveDemoDocumentLimitForAttempt(demoCount: number): number | null {
  if (demoCount >= DEMO_RUNTIME_LIMITS.length) {
    return null
  }

  return DEMO_RUNTIME_LIMITS[demoCount] ?? null
}

export function resolveDemoDocumentLimit(): number {
  return DEMO_DOCUMENT_LIMIT
}
