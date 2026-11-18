import { listTebligatCompanies } from '@/lib/db/tebligat-companies'
import { requirePackage } from '@/lib/user-auth'
import { PortalShell } from '@/components/portal/portal-shell'
import { TebligatTable } from '@/components/portal/tebligat-table'

export const dynamic = 'force-dynamic'

export default async function TebligatRootPage() {
  // Sunucu tarafı kontrol: Tebligat paketi veya admin zorunlu
  const session = await requirePackage('tebligat')

  const userId = session.role === 'admin' ? null : session.userId
  const companies = await listTebligatCompanies({ userId })

  return (
    <PortalShell user={session}>
      <TebligatTable initialCompanies={companies} />
    </PortalShell>
  )
}
