export const ADMIN_ENV_KEYS = ['ADMIN_USERNAME', 'ADMIN_PASSWORD', 'ADMIN_SESSION_SECRET'] as const

export type AdminEnvKey = (typeof ADMIN_ENV_KEYS)[number]

export const MIN_ADMIN_SESSION_SECRET_LENGTH = 32

export function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === 'production'
}

function readEnv(name: AdminEnvKey): string | null {
  const value = process.env[name]?.trim()
  return value || null
}

export function isAdminProductionConfigValid(): boolean {
  if (!isProductionRuntime()) {
    return true
  }

  const username = readEnv('ADMIN_USERNAME')
  const password = readEnv('ADMIN_PASSWORD')
  const sessionSecret = readEnv('ADMIN_SESSION_SECRET')

  return Boolean(
    username &&
      password &&
      sessionSecret &&
      sessionSecret.length >= MIN_ADMIN_SESSION_SECRET_LENGTH,
  )
}

export function getAdminSessionSecret(): string | null {
  const configured = readEnv('ADMIN_SESSION_SECRET')

  if (isProductionRuntime()) {
    if (!configured || configured.length < MIN_ADMIN_SESSION_SECRET_LENGTH) {
      return null
    }
    return configured
  }

  return configured || 'dosyora-dev-session-secret-min-32-chars!!'
}

export type AdminCredentials = {
  username: string
  password: string
}

export function getAdminCredentials(): AdminCredentials | null {
  if (isProductionRuntime()) {
    if (!isAdminProductionConfigValid()) {
      return null
    }

    return {
      username: readEnv('ADMIN_USERNAME')!,
      password: readEnv('ADMIN_PASSWORD')!,
    }
  }

  return {
    username: readEnv('ADMIN_USERNAME') || 'admin',
    password: readEnv('ADMIN_PASSWORD') || 'dosyora-admin',
  }
}
