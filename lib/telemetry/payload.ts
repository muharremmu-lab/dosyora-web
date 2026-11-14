const SHA256_HEX = /^[a-f0-9]{64}$/
const APP_VERSION = /^[0-9A-Za-z.+_-]{1,32}$/
const ERROR_CODE = /^[A-Za-z0-9._:-]{1,64}$/
const STEP = /^[\p{L}\p{N} ._:/-]{1,80}$/u
const OS_VERSION = /^[\p{L}\p{N} ._()+-]{1,80}$/u
const DETAIL_MAX = 400

const ALLOWED_KEYS = new Set(['appVersion', 'hwidHash', 'errorCode', 'step', 'detail', 'osVersion'])

const LABELED_IDENTITY =
  /(?:vkn|tckn|vergi\s*kimlik|vergi\s*numaras[ıi]|vergi\s*no|tc\s*kimlik)\s*[:=]?\s*\d{10,11}/i
const SECRET_ASSIGNMENT =
  /(?:password|passwd|şifre|sifre|parola|authorization|cookie)\s*[:=]\s*\S+/i
const DOCUMENT_MARKER = /%PDF-|tebligZamani|gonderimZamani|belgeIcerik|zarfIcerik/i
const LONG_BASE64 = /[A-Za-z0-9+/]{80,}={0,2}/

export type TelemetryPayload = {
  appVersion: string
  hwidHash: string
  errorCode: string
  step: string
  detail: string
  osVersion: string | null
}

function isSensitive(value: string): boolean {
  const trimmed = value.trim()
  if (/^\d{10}$/.test(trimmed) || /^\d{11}$/.test(trimmed)) return true
  return (
    LABELED_IDENTITY.test(trimmed) ||
    SECRET_ASSIGNMENT.test(trimmed) ||
    DOCUMENT_MARKER.test(trimmed) ||
    LONG_BASE64.test(trimmed)
  )
}

export function readTelemetryPayload(body: unknown): TelemetryPayload | null {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null

  const record = body as Record<string, unknown>
  for (const key of Object.keys(record)) {
    if (!ALLOWED_KEYS.has(key)) return null
  }

  if (
    typeof record.appVersion !== 'string' ||
    typeof record.hwidHash !== 'string' ||
    typeof record.errorCode !== 'string' ||
    typeof record.step !== 'string' ||
    typeof record.detail !== 'string'
  ) {
    return null
  }

  if (record.osVersion !== undefined && record.osVersion !== null && typeof record.osVersion !== 'string') {
    return null
  }

  const appVersion = record.appVersion.trim()
  const hwidHash = record.hwidHash.trim().toLowerCase()
  const errorCode = record.errorCode.trim()
  const step = record.step.trim()
  const detail = record.detail.trim()
  const osVersion = typeof record.osVersion === 'string' ? record.osVersion.trim() : ''

  if (!APP_VERSION.test(appVersion) || !SHA256_HEX.test(hwidHash) || !ERROR_CODE.test(errorCode)) {
    return null
  }

  if (!STEP.test(step) || detail.length === 0 || detail.length > DETAIL_MAX || !OS_VERSION.test(osVersion || 'na')) {
    return null
  }

  if (osVersion && !OS_VERSION.test(osVersion)) return null

  const scanned = [appVersion, hwidHash, errorCode, step, detail, osVersion]
  if (scanned.some((value) => value && isSensitive(value))) return null

  return {
    appVersion,
    hwidHash,
    errorCode,
    step,
    detail,
    osVersion: osVersion || null,
  }
}
