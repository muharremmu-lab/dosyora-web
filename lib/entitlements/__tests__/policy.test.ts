import { describe, expect, it } from 'vitest'

import {
  canProcessDocument,
  getDocumentEntitlement,
  getRemainingDocumentQuota,
  resolveDemoDocumentLimit,
} from '@/lib/entitlements/policy'

describe('entitlement policy', () => {
  it('assigns fixed 50 document limit for new demo accounts', () => {
    expect(resolveDemoDocumentLimit()).toBe(50)
  })

  it('preserves legacy demo document limits stored on the account', () => {
    const entitlement = getDocumentEntitlement({
      account_type: 'DEMO',
      document_limit: 75,
      used_documents: 10,
    })

    expect(entitlement.limit).toBe(75)
    expect(entitlement.remaining).toBe(65)
  })

  it('falls back to 50 when demo account has no stored limit', () => {
    const entitlement = getDocumentEntitlement({
      account_type: 'DEMO',
      document_limit: null,
      used_documents: 13,
    })

    expect(entitlement.remaining).toBe(37)
    expect(entitlement.canProcess).toBe(true)
  })

  it('blocks DEMO accounts at zero quota', () => {
    expect(
      canProcessDocument({
        account_type: 'DEMO',
        document_limit: 50,
        used_documents: 50,
      }),
    ).toBe(false)
  })

  it('treats OWNER and INTERNAL as unlimited', () => {
    for (const accountType of ['OWNER', 'INTERNAL'] as const) {
      const entitlement = getDocumentEntitlement({
        account_type: accountType,
        document_limit: null,
        used_documents: 999,
      })

      expect(entitlement.unlimited).toBe(true)
      expect(entitlement.canProcess).toBe(true)
      expect(getRemainingDocumentQuota({
        account_type: accountType,
        document_limit: null,
        used_documents: 999,
      })).toBeNull()
    }
  })
})
