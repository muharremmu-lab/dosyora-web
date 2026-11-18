import { redirect } from 'next/navigation'
import { requirePackage } from '@/lib/user-auth'

export const dynamic = 'force-dynamic'

export default async function TebligatPortalPage() {
  await requirePackage('tebligat')
  redirect('/tebligat')
}
