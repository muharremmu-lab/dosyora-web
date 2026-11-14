import { dbInsertReturningId, dbQueryAll, dbQueryOne, dbRun } from '@/lib/db/query'

import {
  addIstanbulDays,
  createOfflineLicenseKey,
  endOfIstanbulDayIso,
  istanbulDateStamp,
  LICENSE_PACKAGES,
  type LicensePackageCode,
} from './offline-key'

export type LicenseOrderStatus = 'provisional' | 'pending' | 'approved' | 'revoked'

export type LicenseOrder = {
  id: number
  createdAt: string
  updatedAt: string
  hwid: string
  packageCode: LicensePackageCode
  fullName: string
  vkn: string
  email: string
  phone: string
  status: LicenseOrderStatus
  licenseKey: string | null
  expiresAt: string | null
  paymentCode: string | null
  priceTl: number
}

export type BankSettings = {
  iban: string
  accountName: string
  notePrefix: string
}

type OrderRow = {
  id: number | bigint
  created_at: string
  updated_at: string
  hwid: string
  package_code: string
  full_name: string
  vkn: string
  email: string
  phone: string
  status: string
  license_key: string | null
  expires_at: string | null
  payment_code: string | null
  price_tl: number | bigint
}

const PROVISIONAL_MS = 12 * 60 * 60 * 1000

function asNumber(value: number | bigint): number {
  return typeof value === 'bigint' ? Number(value) : value
}

function mapOrder(row: OrderRow): LicenseOrder {
  return {
    id: asNumber(row.id),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    hwid: row.hwid,
    packageCode: row.package_code as LicensePackageCode,
    fullName: row.full_name,
    vkn: row.vkn,
    email: row.email,
    phone: row.phone,
    status: row.status as LicenseOrderStatus,
    licenseKey: row.license_key,
    expiresAt: row.expires_at,
    paymentCode: row.payment_code,
    priceTl: asNumber(row.price_tl),
  }
}

function isActive(order: LicenseOrder, now = Date.now()): boolean {
  if (!order.expiresAt) return false
  return Date.parse(order.expiresAt) > now
}

export async function getBankSettings(): Promise<BankSettings> {
  const rows = await dbQueryAll<{ setting_key: string; setting_value: string }>(
    'licenseSettings.list',
    'SELECT setting_key, setting_value FROM license_settings',
  )
  const values = new Map(rows.map((row) => [row.setting_key, row.setting_value]))
  return {
    iban: values.get('iban') ?? '',
    accountName: values.get('account_name') ?? 'DOSYORA',
    notePrefix: values.get('note_prefix')?.trim() || 'GT',
  }
}

export async function saveBankSettings(settings: BankSettings): Promise<void> {
  const pairs: Array<[string, string]> = [
    ['iban', settings.iban],
    ['account_name', settings.accountName],
    ['note_prefix', settings.notePrefix || 'GT'],
  ]
  for (const [key, value] of pairs) {
    await dbRun(
      'licenseSettings.upsert',
      `INSERT INTO license_settings (setting_key, setting_value) VALUES (?, ?)
       ON CONFLICT(setting_key) DO UPDATE SET setting_value = excluded.setting_value`,
      [key, value],
    )
  }
}

async function ordersForIdentity(hwid: string, vkn: string): Promise<LicenseOrder[]> {
  const rows = await dbQueryAll<OrderRow>(
    'licenseOrders.byIdentity',
    `SELECT * FROM license_orders
     WHERE hwid = ? OR vkn = ?
     ORDER BY id DESC`,
    [hwid, vkn],
  )
  return rows.map(mapOrder)
}

function usedProvisionalRight(orders: LicenseOrder[]): boolean {
  return orders.some((order) => order.status === 'provisional' || order.status === 'approved' || order.status === 'revoked')
}

export async function applyForLicense(input: {
  hwid: string
  packageCode: LicensePackageCode
  fullName: string
  vkn: string
  email: string
  phone: string
}): Promise<{ order: LicenseOrder; reused: boolean }> {
  const existing = await ordersForIdentity(input.hwid, input.vkn)
  const active = existing.find((order) => order.hwid === input.hwid && order.status === 'provisional' && isActive(order))
  if (active) {
    return { order: active, reused: true }
  }

  const now = new Date()
  const createdAt = now.toISOString()
  const grantProvisional = !usedProvisionalRight(existing)
  const expiresAt = grantProvisional ? new Date(now.getTime() + PROVISIONAL_MS).toISOString() : null
  const licenseKey = grantProvisional
    ? createOfflineLicenseKey(input.hwid, input.packageCode, istanbulDateStamp(new Date(expiresAt!)))
    : null
  const status: LicenseOrderStatus = grantProvisional ? 'provisional' : 'pending'

  let id: number
  try {
    id = await dbInsertReturningId(
      'licenseOrders.insert',
      `INSERT INTO license_orders (
        created_at, updated_at, hwid, package_code, full_name, vkn, email, phone,
        status, license_key, expires_at, payment_code, price_tl
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING id`,
      [
        createdAt,
        createdAt,
        input.hwid,
        input.packageCode,
        input.fullName,
        input.vkn,
        input.email,
        input.phone,
        status,
        licenseKey,
        expiresAt,
        null,
        LICENSE_PACKAGES[input.packageCode].priceTl,
      ],
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    if (!message.toLowerCase().includes('unique')) throw error
    const again = await ordersForIdentity(input.hwid, input.vkn)
    const current = again.find((order) => order.hwid === input.hwid && order.status === 'provisional' && isActive(order))
    if (current) return { order: current, reused: true }
    return applyForLicense(input)
  }

  const settings = await getBankSettings()
  const paymentCode = `${settings.notePrefix}-${id}`
  await dbRun(
    'licenseOrders.setPaymentCode',
    'UPDATE license_orders SET payment_code = ?, updated_at = ? WHERE id = ?',
    [paymentCode, createdAt, id],
  )

  const order = await getOrder(id)
  if (!order) {
    throw new Error('Başvuru kaydedilemedi.')
  }
  return { order, reused: false }
}

export async function getOrder(id: number): Promise<LicenseOrder | null> {
  const row = await dbQueryOne<OrderRow>('licenseOrders.byId', 'SELECT * FROM license_orders WHERE id = ?', [id])
  return row ? mapOrder(row) : null
}

export async function listLicenseOrders(limit = 100): Promise<LicenseOrder[]> {
  const rows = await dbQueryAll<OrderRow>(
    'licenseOrders.list',
    'SELECT * FROM license_orders ORDER BY id DESC LIMIT ?',
    [limit],
  )
  return rows.map(mapOrder)
}

export async function approveLicenseOrder(id: number): Promise<LicenseOrder | null> {
  const current = await getOrder(id)
  if (!current) return null
  const stamp = addIstanbulDays(365)
  const expiresAt = endOfIstanbulDayIso(stamp)
  const licenseKey = createOfflineLicenseKey(current.hwid, current.packageCode, stamp)
  const updatedAt = new Date().toISOString()
  await dbRun(
    'licenseOrders.approve',
    `UPDATE license_orders
     SET status = 'approved', license_key = ?, expires_at = ?, updated_at = ?
     WHERE id = ?`,
    [licenseKey, expiresAt, updatedAt, id],
  )
  return getOrder(id)
}

export async function revokeLicenseOrder(id: number): Promise<LicenseOrder | null> {
  const current = await getOrder(id)
  if (!current) return null
  await dbRun(
    'licenseOrders.revoke',
    `UPDATE license_orders SET status = 'revoked', updated_at = ? WHERE id = ?`,
    [new Date().toISOString(), id],
  )
  return getOrder(id)
}

export async function licenseCheck(hwid: string): Promise<
  | { status: 'provisional' | 'approved'; licenseKey: string; package: LicensePackageCode; expiresAt: string }
  | { status: 'revoked' | 'pending' | 'none' }
> {
  const rows = await dbQueryAll<OrderRow>(
    'licenseOrders.byHwid',
    'SELECT * FROM license_orders WHERE hwid = ? ORDER BY id DESC',
    [hwid],
  )
  const orders = rows.map(mapOrder)
  const approved = orders.find((order) => order.status === 'approved' && order.licenseKey && isActive(order))
  if (approved?.licenseKey && approved.expiresAt) {
    return {
      status: 'approved',
      licenseKey: approved.licenseKey,
      package: approved.packageCode,
      expiresAt: approved.expiresAt,
    }
  }

  const provisional = orders.find((order) => order.status === 'provisional' && order.licenseKey && isActive(order))
  if (provisional?.licenseKey && provisional.expiresAt) {
    return {
      status: 'provisional',
      licenseKey: provisional.licenseKey,
      package: provisional.packageCode,
      expiresAt: provisional.expiresAt,
    }
  }

  if (orders.some((order) => order.status === 'revoked' || order.status === 'provisional' || order.status === 'approved')) {
    return { status: 'revoked' }
  }

  if (orders.some((order) => order.status === 'pending')) {
    return { status: 'pending' }
  }

  return { status: 'none' }
}

export function displayStatus(order: LicenseOrder): 'provisional' | 'pending' | 'approved' | 'expired' {
  if (order.status === 'approved' && isActive(order)) return 'approved'
  if (order.status === 'provisional' && isActive(order)) return 'provisional'
  if (order.status === 'pending') return 'pending'
  return 'expired'
}
