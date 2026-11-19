import { createHmac } from 'node:crypto'

const FALLBACK_SECRET = 'f3c8a1d6e9b0472c5a8e1d4f7b0c6a93e2d5f8a1b4c7e0d3'

export const LICENSE_PACKAGES = {
  F1: { title: 'Firma Paketi', priceTl: 200, capacity: 1 },
  MM50: { title: 'Mali Müşavir 50', priceTl: 500, capacity: 50 },
  MM100: { title: 'Mali Müşavir 100', priceTl: 750, capacity: 100 },
  MM200: { title: 'Mali Müşavir 200', priceTl: 1000, capacity: 200 },
} as const

export type LicensePackageCode = keyof typeof LICENSE_PACKAGES

export function normalizeHardwareId(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const hwid = value.trim().toUpperCase()
  return /^[0-9A-F]{64}$/.test(hwid) ? hwid : null
}

export function isLicensePackage(value: string): value is LicensePackageCode {
  return Object.prototype.hasOwnProperty.call(LICENSE_PACKAGES, value)
}

export function istanbulDateStamp(date = new Date()): string {
  const formatted = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
  return formatted.replaceAll('-', '')
}

export function addIstanbulDays(days: number, from = new Date()): string {
  const stamp = istanbulDateStamp(from)
  const year = Number(stamp.slice(0, 4))
  const month = Number(stamp.slice(4, 6))
  const day = Number(stamp.slice(6, 8))
  const shifted = new Date(Date.UTC(year, month - 1, day + days))
  const nextYear = shifted.getUTCFullYear()
  const nextMonth = String(shifted.getUTCMonth() + 1).padStart(2, '0')
  const nextDay = String(shifted.getUTCDate()).padStart(2, '0')
  return `${nextYear}${nextMonth}${nextDay}`
}

export function endOfIstanbulDayIso(stamp: string): string {
  const year = Number(stamp.slice(0, 4))
  const month = Number(stamp.slice(4, 6))
  const day = Number(stamp.slice(6, 8))
  return new Date(Date.UTC(year, month - 1, day, 20, 59, 59)).toISOString()
}

export function createOfflineLicenseKey(
  hardwareId: string,
  packageCode: LicensePackageCode | 'UNLIMITED',
  expiresOn: string,
): string {
  const hwid = normalizeHardwareId(hardwareId)
  if (!hwid || !/^\d{8}$/.test(expiresOn)) {
    throw new Error('Lisans anahtarı üretilemedi.')
  }

  const secret = process.env.LICENSE_HMAC_SECRET?.trim() || FALLBACK_SECRET
  const payload = `${packageCode}|${expiresOn}|${hwid}`
  const signature = createHmac('sha256', secret).update(payload, 'utf8').digest('hex').toUpperCase()
  return `PRO-${packageCode}-${expiresOn}-${hwid.slice(0, 16)}-${signature}`
}
