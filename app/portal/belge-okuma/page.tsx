import { redirect } from 'next/navigation'
import { requirePackage } from '@/lib/user-auth'

export const dynamic = 'force-dynamic'

export default async function BelgeOkumaRootPage() {
  await requirePackage('belge_okuma')
  redirect('/portal/belge-okuma/yukle')
}
