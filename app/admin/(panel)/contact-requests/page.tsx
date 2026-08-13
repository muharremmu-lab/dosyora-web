import Link from 'next/link'

import { AdminShell, Pagination } from '@/components/admin'
import { Card } from '@/components/ui'
import {
  CONTACT_REQUEST_TYPE_LABELS,
  formatContactRequestStatus,
  formatDateTime,
} from '@/lib/admin/labels'
import { listContactRequests, type ContactRequestFilter } from '@/lib/db/contact-requests'
import { formInputClassName } from '@/lib/form-styles'

type ContactRequestsPageProps = {
  searchParams: Promise<{
    page?: string
    search?: string
    filter?: string
  }>
}

function parseFilter(value?: string): ContactRequestFilter {
  if (value === 'demo' || value === 'request') return value
  return 'all'
}

export default async function ContactRequestsPage({ searchParams }: ContactRequestsPageProps) {
  const params = await searchParams
  const page = Number.parseInt(params.page ?? '1', 10) || 1
  const search = params.search?.trim() || undefined
  const filter = parseFilter(params.filter)

  const result = await listContactRequests({ page, limit: 20, search, filter })

  return (
    <AdminShell
      title="İletişim Talepleri"
      description="Demo talepleri ve istek/öneri mesajlarını tek yerden yönetin"
    >
      <Card className="mb-6">
        <form method="get" className="grid gap-4 md:grid-cols-3" aria-label="İletişim talepleri filtre formu">
          <label className="block space-y-1.5 md:col-span-2">
            <span className="text-sm font-medium text-[var(--ds-color-text)]">Arama</span>
            <input
              type="search"
              name="search"
              defaultValue={search ?? ''}
              placeholder="Ad, firma, e-posta, telefon"
              className={formInputClassName}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-[var(--ds-color-text)]">Tür</span>
            <select name="filter" defaultValue={filter} className={formInputClassName}>
              <option value="all">Tümü</option>
              <option value="demo">Demo Talepleri</option>
              <option value="request">İstek / Öneriler</option>
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
              <th className="px-4 py-3 font-semibold text-[var(--ds-color-text)]">Tarih</th>
              <th className="px-4 py-3 font-semibold text-[var(--ds-color-text)]">Tür</th>
              <th className="px-4 py-3 font-semibold text-[var(--ds-color-text)]">Ad Soyad</th>
              <th className="px-4 py-3 font-semibold text-[var(--ds-color-text)]">Firma</th>
              <th className="px-4 py-3 font-semibold text-[var(--ds-color-text)]">Telefon</th>
              <th className="px-4 py-3 font-semibold text-[var(--ds-color-text)]">E-posta</th>
              <th className="px-4 py-3 font-semibold text-[var(--ds-color-text)]">Durum</th>
            </tr>
          </thead>
          <tbody>
            {result.items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[var(--ds-color-text-muted)]">
                  Kayıt bulunamadı.
                </td>
              </tr>
            ) : (
              result.items.map((item) => (
                <tr key={item.key} className="border-b border-[var(--ds-color-border)] last:border-b-0">
                  <td className="px-4 py-3 text-[var(--ds-color-text-muted)]">
                    {formatDateTime(item.created_at)}
                  </td>
                  <td className="px-4 py-3 text-[var(--ds-color-text)]">
                    {CONTACT_REQUEST_TYPE_LABELS[item.type]}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/contact-requests/${item.type === 'DEMO' ? 'demo' : 'contact'}/${item.id}`}
                      className="font-medium text-[var(--ds-color-primary)] hover:underline"
                    >
                      {item.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[var(--ds-color-text-muted)]">{item.company ?? '—'}</td>
                  <td className="px-4 py-3 text-[var(--ds-color-text-muted)]">{item.phone ?? '—'}</td>
                  <td className="px-4 py-3 text-[var(--ds-color-text-muted)]">{item.email}</td>
                  <td className="px-4 py-3 text-[var(--ds-color-text)]">
                    {formatContactRequestStatus(item.type, item.status)}
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
        basePath="/admin/contact-requests"
        searchParams={{ search, filter: filter === 'all' ? undefined : filter }}
      />
    </AdminShell>
  )
}
