export type DemoRequestContext = {
  email: string
  ipAddress: string
  userAgent: string | null
  phone?: string | null
  browserFingerprint?: string | null
  cookieId?: string | null
  deviceId?: string | null
}

export function buildDemoRequestContext(input: {
  email: string
  ipAddress: string
  userAgent?: string | null
  phone?: string | null
  browserFingerprint?: string | null
  cookieId?: string | null
  deviceId?: string | null
}): DemoRequestContext {
  return {
    email: input.email.trim().toLowerCase(),
    ipAddress: input.ipAddress,
    userAgent: input.userAgent ?? null,
    phone: input.phone ?? null,
    browserFingerprint: input.browserFingerprint ?? null,
    cookieId: input.cookieId ?? null,
    deviceId: input.deviceId ?? null,
  }
}
