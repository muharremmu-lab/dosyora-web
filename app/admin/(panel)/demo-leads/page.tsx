import Link from 'next/link'

import { AdminShell, Pagination, StatusBadge } from '@/components/admin'
import { Card } from '@/components/ui'
import { ACCOUNT_STATUSES, getRemainingDocuments } from '@/lib/db/types'
import { listDemoLeads } from '@/lib/db/demo-leads'
import { ACCOUNT_STATUS_LABELS, formatDateTime } from '@/lib/admin/labels'
import { parseAccountStatus, parsePositiveInt } from '@/lib/admin/query'
import { formInputClassName } from '@/lib/form-styles'

type DemoLeadsPageProps = {
  searchParams: Promise<{
    page?: string
    search?: string
    status?: string
    source?: string
  }>
}

export default async function DemoLeadsPage({ searchParams }: DemoLeadsPageProps) {
  const params = await searchParams
  const page = parsePositiveInt(params.page ?? null, 1)
  const search = params.search?.trim() || undefined
  const accountStatus = parseAccountStatus(params.status ?? null)
  const source = params.source?.trim() || undefined

  const result = await listDemoLeads({ page, limit: 20, search, accountStatus, source })

  return (
    <AdminShell title="Demo Talepleri" description="Demo formundan gelen talepleri yönetin">
      <Card className="mb-6">
        <form method="get" className="grid gap-4 md:grid-cols-4" aria-label="Demo talepleri filtre formu">
          <label className="block space-y-1.5 md:col-span-2">
            <span className="text-sm font-medium text-[var(--ds-color-text)]">Arama</span>
            <input
              type="search"
              name="search"
              defaultValue={search ?? ''}
              placeholder="Firma, yetkili, e-posta, telefon"
              className={formInputClassName}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-[var(--ds-color-text)]">Durum</span>
            <select name="status" defaultValue={accountStatus ?? ''} className={formInputClassName}>
              <option value="">Tümü</option>
              {ACCOUNT_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {ACCOUNT_STATUS_LABELS[item]}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-[var(--ds-color-text)]">Kaynak</span>
            <input
              type="text"
              name="source"
              defaultValue={source ?? ''}
              placeholder="website"
              className={formInputClassName}
            />
          </label>
          <div className="md:col-span-4">
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
              <th className="px-4 py-3 font-semibold text-[var(--ds-color-text)]">Oluşturulma Tarihi</th>
              <th className="px-4 py-3 font-semibold text-[var(--ds-color-text)]">Firma</th>
              <th className="px-4 py-3 font-semibold text-[var(--ds-color-text)]">Yetkili</th>
              <th className="px-4 py-3 font-semibold text-[var(--ds-color-text)]">E-posta</th>
              <th className="px-4 py-3 font-semibold text-[var(--ds-color-text)]">Telefon</th>
              <th className="px-4 py-3 font-semibold text-[var(--ds-color-text)]">Belge Limiti</th>
              <th className="px-4 py-3 font-semibold text-[var(--ds-color-text)]">Kullanılan Belge</th>
              <th className="px-4 py-3 font-semibold text-[var(--ds-color-text)]">Kalan Belge</th>
              <th className="px-4 py-3 font-semibold text-[var(--ds-color-text)]">Hesap Durumu</th>
            </tr>
          </thead>
          <tbody>
            {result.items.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-[var(--ds-color-text-muted)]">
                  Kayıt bulunamadı.
                </td>
              </tr>
            ) : (
              result.items.map((lead) => {
                const remaining = getRemainingDocuments(lead)

                return (
                  <tr key={lead.id} className="border-b border-[var(--ds-color-border)] last:border-b-0">
                    <td className="px-4 py-3 text-[var(--ds-color-text-muted)]">
                      {formatDateTime(lead.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/demo-leads/${lead.id}`}
                        className="font-medium text-[var(--ds-color-primary)] hover:underline"
                      >
                        {lead.company_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[var(--ds-color-text)]">{lead.contact_name}</td>
                    <td className="px-4 py-3 text-[var(--ds-color-text-muted)]">{lead.email}</td>
                    <td className="px-4 py-3 text-[var(--ds-color-text-muted)]">{lead.phone}</td>
                    <td className="px-4 py-3 text-[var(--ds-color-text)]">{lead.document_limit ?? '—'}</td>
                    <td className="px-4 py-3 text-[var(--ds-color-text)]">{lead.used_documents}</td>
                    <td className="px-4 py-3 text-[var(--ds-color-text)]">
                      {remaining ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      {lead.account_status ? (
                        <StatusBadge kind="account" status={lead.account_status} />
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </Card>

      <Pagination
        page={result.page}
        totalPages={result.totalPages}
        basePath="/admin/demo-leads"
        searchParams={{ search, status: accountStatus, source }}
      />
    </AdminShell>
  )
}
