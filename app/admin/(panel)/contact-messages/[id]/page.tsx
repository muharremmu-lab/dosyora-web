import Link from 'next/link'
import { notFound } from 'next/navigation'

import { AdminShell, ContactMessageDetailForm } from '@/components/admin'
import { getContactMessageById } from '@/lib/db/contact-messages'
import { formatDateTime } from '@/lib/admin/labels'

type ContactMessageDetailPageProps = {
  params: Promise<{ id: string }>
}

export default async function ContactMessageDetailPage({ params }: ContactMessageDetailPageProps) {
  const { id: rawId } = await params
  const id = Number.parseInt(rawId, 10)

  if (!Number.isFinite(id) || id <= 0) {
    notFound()
  }

  const message = getContactMessageById(id)
  if (!message) {
    notFound()
  }

  return (
    <AdminShell
      title={`İletişim Mesajı #${message.id}`}
      description={`Oluşturulma: ${formatDateTime(message.created_at)}`}
    >
      <p className="mb-6">
        <Link
          href="/admin/contact-messages"
          className="text-sm font-medium text-[var(--ds-color-primary)] hover:underline"
        >
          ← İletişim mesajlarına dön
        </Link>
      </p>
      <ContactMessageDetailForm message={message} />
    </AdminShell>
  )
}
