import { describe, expect, it } from 'vitest'

import {
  CONTACT_SECTION_ID,
  contactFormHref,
  parseContactFormType,
} from '@/lib/contact-routes'

describe('contact routes', () => {
  it('builds default contact href', () => {
    expect(contactFormHref()).toBe(`/#${CONTACT_SECTION_ID}`)
  })

  it('builds demo contact href', () => {
    expect(contactFormHref('demo')).toBe(`/?type=demo#${CONTACT_SECTION_ID}`)
  })

  it('parses demo type from query value', () => {
    expect(parseContactFormType('demo')).toBe('demo')
    expect(parseContactFormType('request')).toBe('request')
    expect(parseContactFormType(undefined)).toBe('request')
  })
})
