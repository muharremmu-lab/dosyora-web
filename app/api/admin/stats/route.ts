export const runtime = 'nodejs'

import {
  countAllContactMessages,
  countContactMessagesByStatus,
} from '@/lib/db/contact-messages'
import {
  countAllDemoAccounts,
  countDemoAccountsByStatus,
  countDemoAccountsToday,
} from '@/lib/db/demo-leads'
import { jsonError, jsonOk } from '@/lib/api-response'
import { logApiError } from '@/lib/api-logger'

export async function GET() {
  try {
    const [
      totalDemoLeads,
      newDemoLeads,
      todayDemoLeads,
      totalContactMessages,
      newContactMessages,
    ] = await Promise.all([
      countAllDemoAccounts(),
      countDemoAccountsByStatus('ACTIVE'),
      countDemoAccountsToday(),
      countAllContactMessages(),
      countContactMessagesByStatus('NEW'),
    ])

    return jsonOk({
      totalDemoLeads,
      newDemoLeads,
      todayDemoLeads,
      totalContactMessages,
      newContactMessages,
    })
  } catch (error) {
    logApiError('admin_stats_failed', {}, error)
    return jsonError('Sunucu hatası.', 500)
  }
}
