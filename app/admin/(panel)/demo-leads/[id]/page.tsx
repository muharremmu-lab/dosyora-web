import Link from 'next/link'
import { notFound } from 'next/navigation'

import { AdminShell, DemoLeadDetailForm } from '@/components/admin'
import { getDemoLeadById } from '@/lib/db/demo-leads'
import { formatDateTime } from '@/lib/admin/labels'

type DemoLeadDetailPageProps = {
  params: Promise<{ id: string }>
}

export default async function DemoLeadDetailPage({ params }: DemoLeadDetailPageProps) {
  const { id: rawId } = await params
  const id = Number.parseInt(rawId, 10)

  if (!Number.isFinite(id) || id <= 0) {
    notFound()
  }

  const lead = await getDemoLeadById(id)
  if (!lead) {
    notFound()
  }

  return (
    <AdminShell
      title={`Demo Talebi #${lead.id}`}
      description={`Oluşturulma: ${formatDateTime(lead.created_at)}`}
    >
      <p className="mb-6">
        <Link href="/admin/demo-leads" className="text-sm font-medium text-[var(--ds-color-primary)] hover:underline">
          ← Demo taleplerine dön
        </Link>
      </p>
      <DemoLeadDetailForm lead={lead} />
    </AdminShell>
  )
}
