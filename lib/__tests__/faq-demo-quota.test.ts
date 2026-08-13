import { describe, expect, it } from 'vitest'

import { DEMO_DOCUMENT_LIMIT } from '@/lib/entitlements/constants'

describe('FAQ demo quota text', () => {
  it('keeps public demo quota at 20 belge', () => {
    expect(DEMO_DOCUMENT_LIMIT).toBe(20)
  })
})
