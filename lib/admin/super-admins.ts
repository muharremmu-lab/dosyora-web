export const SUPER_ADMIN_EMAILS = ['ege@dosyora.com', 'muharrem@dosyora.com'] as const

export const ADMIN_MODULES = [
  'dashboard',
  'license_approvals',
  'license_orders',
  'license_settings',
  'feedback',
  'demo_leads',
  'contact_messages',
  'notifications',
  'reports',
  'backend_operations',
] as const

export type AdminModule = (typeof ADMIN_MODULES)[number]
export type AdminRole = 'super_admin' | 'admin'

export function normalizeAdminEmail(value: string): string {
  return value.trim().toLowerCase()
}

export function isSuperAdminEmail(value: string | null | undefined): boolean {
  if (!value) return false
  const email = normalizeAdminEmail(value)
  return SUPER_ADMIN_EMAILS.some((candidate) => candidate === email)
}

export function canAccessAdminModule(email: string | null | undefined, _module: AdminModule): boolean {
  return isSuperAdminEmail(email)
}
