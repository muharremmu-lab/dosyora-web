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
    return jsonOk({
      totalDemoLeads: countAllDemoAccounts(),
      newDemoLeads: countDemoAccountsByStatus('ACTIVE'),
      todayDemoLeads: countDemoAccountsToday(),
      totalContactMessages: countAllContactMessages(),
      newContactMessages: countContactMessagesByStatus('NEW'),
    })
  } catch (error) {
    logApiError('admin_stats_failed', {}, error)
    return jsonError('Sunucu hatası.', 500)
  }
}
