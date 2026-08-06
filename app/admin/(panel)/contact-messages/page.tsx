import Link from 'next/link'

import { AdminShell, Pagination, StatusBadge } from '@/components/admin'
import { Card } from '@/components/ui'
import { CONTACT_MESSAGE_STATUSES } from '@/lib/db/types'
import { listContactMessages } from '@/lib/db/contact-messages'
import { CONTACT_STATUS_LABELS, formatDateTime } from '@/lib/admin/labels'
import { parseContactMessageStatus, parsePositiveInt } from '@/lib/admin/query'
import { formInputClassName } from '@/lib/form-styles'

type ContactMessagesPageProps = {
  searchParams: Promise<{
    page?: string
    search?: string
    status?: string
  }>
}

export default async function ContactMessagesPage({ searchParams }: ContactMessagesPageProps) {
  const params = await searchParams
  const page = parsePositiveInt(params.page ?? null, 1)
  const search = params.search?.trim() || undefined
  const status = parseContactMessageStatus(params.status ?? null)

  const result = await listContactMessages({ page, limit: 20, search, status })

  return (
    <AdminShell title="İletişim Mesajları" description="Gelen iletişim formlarını yönetin">
      <Card className="mb-6">
        <form method="get" className="grid gap-4 md:grid-cols-3" aria-label="İletişim mesajları filtre formu">
          <label className="block space-y-1.5 md:col-span-2">
            <span className="text-sm font-medium text-[var(--ds-color-text)]">Arama</span>
            <input
              type="search"
              name="search"
              defaultValue={search ?? ''}
              placeholder="Ad, e-posta, telefon, konu"
              className={formInputClassName}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-[var(--ds-color-text)]">Durum</span>
            <select name="status" defaultValue={status ?? ''} className={formInputClassName}>
              <option value="">Tümü</option>
              {CONTACT_MESSAGE_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {CONTACT_STATUS_LABELS[item]}
                </option>
              ))}
            </select>
          </label>
          <div className="md:col-span-3">
            <button
              type="submit"
              className="rounded-[var(--ds-radius-md)] bg-[var(--ds-color-primary)] px-4 py-2 text-sm font-medium text-[var(--ds-color-secondary)] ds-transition-hover hover:opacity-90"
            >
              Filtrele
            </button>
          </div>
        </form>
      </Card>

      <Card className="overflow-x-auto p-0">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[var(--ds-color-border)] bg-[var(--ds-color-surface-alt)]">
            <tr>
              <th className="px-4 py-3 font-semibold text-[var(--ds-color-text)]">Ad Soyad</th>
              <th className="px-4 py-3 font-semibold text-[var(--ds-color-text)]">E-posta</th>
              <th className="px-4 py-3 font-semibold text-[var(--ds-color-text)]">Konu</th>
              <th className="px-4 py-3 font-semibold text-[var(--ds-color-text)]">Tarih</th>
              <th className="px-4 py-3 font-semibold text-[var(--ds-color-text)]">Durum</th>
            </tr>
          </thead>
          <tbody>
            {result.items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[var(--ds-color-text-muted)]">
                  Kayıt bulunamadı.
                </td>
              </tr>
            ) : (
              result.items.map((message) => (
                <tr key={message.id} className="border-b border-[var(--ds-color-border)] last:border-b-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/contact-messages/${message.id}`}
                      className="font-medium text-[var(--ds-color-primary)] hover:underline"
                    >
                      {message.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[var(--ds-color-text-muted)]">{message.email}</td>
                  <td className="px-4 py-3 text-[var(--ds-color-text)]">{message.subject}</td>
                  <td className="px-4 py-3 text-[var(--ds-color-text-muted)]">
                    {formatDateTime(message.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge kind="contact" status={message.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      <Pagination
        page={result.page}
        totalPages={result.totalPages}
        basePath="/admin/contact-messages"
        searchParams={{ search, status }}
      />
    </AdminShell>
  )
}
