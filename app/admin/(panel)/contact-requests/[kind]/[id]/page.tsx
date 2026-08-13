import Link from 'next/link'
import { notFound } from 'next/navigation'

import { AdminShell, ContactMessageDetailForm } from '@/components/admin'
import { DemoInquiryDetailForm } from '@/components/admin/demo-inquiry-detail-form'
import { getContactMessageById } from '@/lib/db/contact-messages'
import { getDemoLeadById } from '@/lib/db/demo-leads'

type ContactRequestDetailPageProps = {
  params: Promise<{ kind: string; id: string }>
}

export default async function ContactRequestDetailPage({ params }: ContactRequestDetailPageProps) {
  const { kind, id: rawId } = await params
  const id = Number.parseInt(rawId, 10)

  if (!Number.isFinite(id) || id <= 0) {
    notFound()
  }

  if (kind === 'demo') {
    const lead = await getDemoLeadById(id)
    if (!lead) notFound()

    return (
      <AdminShell title="Demo Talebi" description={`Kayıt #${lead.id}`}>
        <Link
          href="/admin/contact-requests"
          className="mb-6 inline-block text-sm font-medium text-[var(--ds-color-primary)] hover:underline"
        >
          ← İletişim Talepleri
        </Link>
        <DemoInquiryDetailForm lead={lead} />
      </AdminShell>
    )
  }

  if (kind === 'contact') {
    const message = await getContactMessageById(id)
    if (!message) notFound()

    return (
      <AdminShell title="İstek / Öneri" description={`Kayıt #${message.id}`}>
        <Link
          href="/admin/contact-requests"
          className="mb-6 inline-block text-sm font-medium text-[var(--ds-color-primary)] hover:underline"
        >
          ← İletişim Talepleri
        </Link>
        <ContactMessageDetailForm message={message} />
      </AdminShell>
    )
  }

  notFound()
}
