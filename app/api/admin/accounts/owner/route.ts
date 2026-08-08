export const runtime = 'nodejs'

import type { NextRequest } from 'next/server'

import { requireAdminMutationAuth } from '@/lib/admin-api-auth'
import { logApiError, logApiInfo } from '@/lib/api-logger'
import { jsonError, jsonOk } from '@/lib/api-response'
import { createOwnerAccount } from '@/lib/db/demo-leads'

export async function POST(request: NextRequest) {
  const authError = await requireAdminMutationAuth(request)
  if (authError) {
    return authError
  }

  try {
    const body = (await request.json()) as {
      company_name?: string
      contact_name?: string
      email?: string
      phone?: string
      customer_user_id?: string
      customer_company_id?: string
    }

    const companyName = String(body.company_name ?? '').trim()
    const contactName = String(body.contact_name ?? '').trim()
    const email = String(body.email ?? '').trim()
    const phone = String(body.phone ?? '').trim() || '-'

    if (!companyName || !contactName || !email) {
      return jsonError('Firma, yetkili ve e-posta zorunludur.', 400)
    }

    const owner = await createOwnerAccount({
      company_name: companyName,
      contact_name: contactName,
      email,
      phone,
      customer_user_id: body.customer_user_id?.trim() || null,
      customer_company_id: body.customer_company_id?.trim() || null,
    })

    logApiInfo('owner_account_created', { leadId: owner.id, email: owner.email })

    return jsonOk({ account: owner }, { status: 201 })
  } catch (error) {
    logApiError('owner_account_create_failed', {}, error)
    return jsonError('Sunucu hatası.', 500)
  }
}
