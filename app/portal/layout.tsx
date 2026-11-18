import { requireUserSession } from '@/lib/user-auth'
import { PortalShell } from '@/components/portal/portal-shell'

export const dynamic = 'force-dynamic'

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireUserSession('/login')

  return <PortalShell user={session}>{children}</PortalShell>
}
