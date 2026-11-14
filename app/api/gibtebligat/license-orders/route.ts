export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { requireAdminApiAuth } from '@/lib/admin-api-auth'
import { jsonError, jsonOk } from '@/lib/api-response'
import { logDbRouteError } from '@/lib/db/libsql-log'
import { displayStatus, getBankSettings, listLicenseOrders } from '@/lib/licensing/orders'

export async function GET() {
  const sessionError = await requireAdminApiAuth()
  if (sessionError) return sessionError

  try {
    const [orders, bank] = await Promise.all([listLicenseOrders(), getBankSettings()])
    return jsonOk({
      bank,
      orders: orders.map((order) => ({
        ...order,
        displayStatus: displayStatus(order),
      })),
    })
  } catch (error) {
    logDbRouteError('gibtebligat_license_orders_failed', error, { operation: 'listLicenseOrders' })
    return jsonError('Lisans başvuruları okunamadı.', 500)
  }
}
