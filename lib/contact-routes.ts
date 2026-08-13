export type ContactFormType = 'demo' | 'request'

export const CONTACT_SECTION_ID = 'iletisim'

export function contactFormHref(type?: ContactFormType): string {
  if (type === 'demo') {
    return `/?type=demo#${CONTACT_SECTION_ID}`
  }
  return `/#${CONTACT_SECTION_ID}`
}

export function parseContactFormType(value: string | null | undefined): ContactFormType {
  return value === 'demo' ? 'demo' : 'request'
}
