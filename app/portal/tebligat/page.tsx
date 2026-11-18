import { listTebligatCompanies } from '@/lib/db/tebligat-companies'
import { requirePackage } from '@/lib/user-auth'
import { TebligatTable } from '@/components/portal/tebligat-table'

export const dynamic = 'force-dynamic'

export default async function TebligatPortalPage() {
  // Sunucu tarafı kontrol: Paketi olmayan giremez
  const session = await requirePackage('tebligat')

  const userId = session.role === 'admin' ? null : session.userId
  const companies = await listTebligatCompanies({ userId })

  return <TebligatTable initialCompanies={companies} />
}
