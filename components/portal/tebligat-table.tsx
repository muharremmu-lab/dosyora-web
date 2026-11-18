'use client'

import { useState } from 'react'
import {
  Building,
  Plus,
  Search,
  RefreshCw,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Trash2,
  Edit2,
  MessageCircle,
} from 'lucide-react'

import { cn } from '@/lib/design-system/cn'
import type { TebligatCompanyRecord } from '@/lib/db/tebligat-companies'

type TebligatTableProps = {
  initialCompanies: TebligatCompanyRecord[]
}

export function TebligatTable({ initialCompanies }: TebligatTableProps) {
  const [companies, setCompanies] = useState<TebligatCompanyRecord[]>(initialCompanies)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<TebligatCompanyRecord | null>(null)
  const [loading, setLoading] = useState(false)
  const [queryingId, setQueryingId] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Form states
  const [formData, setFormData] = useState({
    company_name: '',
    vkn: '',
    authorized_person: '',
    phone: '',
    whatsapp: '',
    email: '',
    query_time: '09:00',
    status: 'active' as 'active' | 'inactive' | 'error',
  })

  const openAddModal = () => {
    setEditingCompany(null)
    setFormData({
      company_name: '',
      vkn: '',
      authorized_person: '',
      phone: '',
      whatsapp: '',
      email: '',
      query_time: '09:00',
      status: 'active',
    })
    setErrorMsg(null)
    setIsModalOpen(true)
  }

  const openEditModal = (comp: TebligatCompanyRecord) => {
    setEditingCompany(comp)
    setFormData({
      company_name: comp.company_name,
      vkn: comp.vkn,
      authorized_person: comp.authorized_person || '',
      phone: comp.phone || '',
      whatsapp: comp.whatsapp || '',
      email: comp.email || '',
      query_time: comp.query_time || '09:00',
      status: comp.status,
    })
    setErrorMsg(null)
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    try {
      const url = editingCompany
        ? `/api/tebligat/companies/${editingCompany.id}`
        : '/api/tebligat/companies'
      const method = editingCompany ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'İşlem başarısız.')
      }

      if (editingCompany) {
        setCompanies((prev) =>
          prev.map((c) => (c.id === editingCompany.id ? (data.company as TebligatCompanyRecord) : c)),
        )
      } else {
        setCompanies((prev) => [data.company as TebligatCompanyRecord, ...prev])
      }

      setIsModalOpen(false)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Kaydedilirken hata oluştu.'
      setErrorMsg(message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" firmasını silmek istediğinize emin misiniz?`)) return

    try {
      const res = await fetch(`/api/tebligat/companies/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Silinemedi')
      setCompanies((prev) => prev.filter((c) => c.id !== id))
    } catch {
      alert('Firma silinirken hata oluştu.')
    }
  }

  const handleManualQuery = async (id: string) => {
    setQueryingId(id)
    try {
      const res = await fetch(`/api/tebligat/companies/${id}/query`, { method: 'POST' })
      const data = await res.json()
      if (res.ok && data.company) {
        setCompanies((prev) =>
          prev.map((c) => (c.id === id ? (data.company as TebligatCompanyRecord) : c)),
        )
        if (data.message) alert(data.message)
      } else {
        alert(data.error || 'Sorgu tetiklenemedi.')
      }
    } catch {
      alert('Sorgulama işlemi başarısız.')
    } finally {
      setQueryingId(null)
    }
  }

  const filtered = companies.filter((c) => {
    const matchesSearch =
      c.company_name.toLowerCase().includes(search.toLowerCase()) ||
      c.vkn.includes(search) ||
      (c.authorized_person && c.authorized_person.toLowerCase().includes(search.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--ds-color-border)] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--ds-color-text)]">
              Tebligat Firmaları
            </h1>
            <span className="rounded bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5">
              GİB Otomasyon
            </span>
          </div>
          <p className="mt-1 text-sm text-[var(--ds-color-text-muted)]">
            E-Tebligat otomatik sorgulama listesi (Belge okuma firmalarından bağımsız ayrı liste).
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-[var(--ds-radius-md)] bg-[var(--ds-color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--ds-color-primary-deep)] ds-transition-hover"
        >
          <Plus className="h-4 w-4" />
          <span>Yeni Firma Ekle</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--ds-color-text-muted)]" />
          <input
            type="text"
            placeholder="Firma adı, VKN veya Yetkili ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-[var(--ds-radius-md)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface)] py-2 pl-9 pr-4 text-sm text-[var(--ds-color-text)] placeholder-[var(--ds-color-text-muted)] focus:border-[var(--ds-color-primary)] focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Firma durumuna göre filtrele"
          className="rounded-[var(--ds-radius-md)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface)] px-3 py-2 text-sm text-[var(--ds-color-text)] focus:border-[var(--ds-color-primary)] focus:outline-none"
        >
          <option value="all">Tüm Durumlar</option>
          <option value="active">Aktif</option>
          <option value="inactive">Pasif</option>
          <option value="error">Hatalı</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-[var(--ds-radius-lg)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface)] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[var(--ds-color-text)]">
            <thead className="border-b border-[var(--ds-color-border)] bg-[var(--ds-color-surface-alt)] text-xs font-semibold uppercase tracking-wider text-[var(--ds-color-text-muted)]">
              <tr>
                <th scope="col" className="px-4 py-3.5">Firma Adı & VKN</th>
                <th scope="col" className="px-4 py-3.5">Yetkili</th>
                <th scope="col" className="px-4 py-3.5">İletişim</th>
                <th scope="col" className="px-4 py-3.5">Sorgu Saati</th>
                <th scope="col" className="px-4 py-3.5">Durum</th>
                <th scope="col" className="px-4 py-3.5">Son Sorgu</th>
                <th scope="col" className="px-4 py-3.5 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--ds-color-border)]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-[var(--ds-color-text-muted)]">
                    <Building className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    Kayıtlı tebligat firması bulunamadı.
                  </td>
                </tr>
              ) : (
                filtered.map((company) => (
                  <tr key={company.id} className="hover:bg-[var(--ds-color-surface-alt)] ds-transition-hover">
                    {/* Firma adı & VKN */}
                    <td className="px-4 py-3.5 font-medium text-[var(--ds-color-text)]">
                      <div className="font-semibold">{company.company_name}</div>
                      <div className="text-xs text-[var(--ds-color-text-muted)] font-mono">VKN: {company.vkn}</div>
                    </td>

                    {/* Yetkili */}
                    <td className="px-4 py-3.5 text-[var(--ds-color-text-muted)]">
                      {company.authorized_person || '-'}
                    </td>

                    {/* İletişim */}
                    <td className="px-4 py-3.5 text-xs text-[var(--ds-color-text-muted)] space-y-1">
                      {company.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-gray-400" />
                          <span>{company.phone}</span>
                        </div>
                      )}
                      {company.whatsapp && (
                        <div className="flex items-center gap-1 text-emerald-600">
                          <MessageCircle className="h-3 w-3" />
                          <span>{company.whatsapp}</span>
                        </div>
                      )}
                      {company.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-gray-400" />
                          <span>{company.email}</span>
                        </div>
                      )}
                      {!company.phone && !company.whatsapp && !company.email && '-'}
                    </td>

                    {/* Sorgu Saati */}
                    <td className="px-4 py-3.5 font-mono text-xs">
                      <div className="flex items-center gap-1.5 text-blue-700 bg-blue-50 px-2 py-0.5 rounded w-fit">
                        <Clock className="h-3 w-3" />
                        <span>{company.query_time || '09:00'}</span>
                      </div>
                    </td>

                    {/* Durum */}
                    <td className="px-4 py-3.5">
                      {company.status === 'active' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                          <CheckCircle className="h-3 w-3" />
                          Aktif
                        </span>
                      )}
                      {company.status === 'inactive' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                          <XCircle className="h-3 w-3" />
                          Pasif
                        </span>
                      )}
                      {company.status === 'error' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">
                          <AlertTriangle className="h-3 w-3" />
                          Hatalı
                        </span>
                      )}
                    </td>

                    {/* Son Sorgu */}
                    <td className="px-4 py-3.5 text-xs text-[var(--ds-color-text-muted)]">
                      {company.last_query_at
                        ? new Date(company.last_query_at).toLocaleString('tr-TR', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })
                        : 'Henüz sorgulanmadı'}
                    </td>

                    {/* İşlemler */}
                    <td className="px-4 py-3.5 text-right space-x-1">
                      <button
                        onClick={() => handleManualQuery(company.id)}
                        disabled={queryingId === company.id}
                        title="Manuel GİB Sorgusu Çalıştır"
                        className="inline-flex items-center gap-1 rounded p-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 hover:text-blue-800"
                      >
                        <RefreshCw className={cn('h-3.5 w-3.5', queryingId === company.id && 'animate-spin')} />
                        <span className="hidden sm:inline">Sorgula</span>
                      </button>
                      <button
                        onClick={() => openEditModal(company)}
                        title="Düzenle"
                        className="rounded p-1.5 text-xs text-[var(--ds-color-text-muted)] hover:bg-gray-100 hover:text-[var(--ds-color-text)]"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(company.id, company.company_name)}
                        title="Sil"
                        className="rounded p-1.5 text-xs text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-[var(--ds-radius-lg)] bg-[var(--ds-color-surface)] p-6 shadow-xl border border-[var(--ds-color-border)]">
            <h2 className="text-lg font-bold text-[var(--ds-color-text)] mb-4">
              {editingCompany ? 'Tebligat Firmasını Düzenle' : 'Yeni Tebligat Firması Ekle'}
            </h2>

            {errorMsg && (
              <div className="mb-4 rounded bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[var(--ds-color-text)] mb-1">
                    Firma Adı *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    className="w-full rounded border border-[var(--ds-color-border)] px-3 py-2 text-sm focus:outline-none focus:border-[var(--ds-color-primary)]"
                    placeholder="Örn: ABC Müşavirlik A.Ş."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--ds-color-text)] mb-1">
                    VKN / TCKN *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={11}
                    value={formData.vkn}
                    onChange={(e) => setFormData({ ...formData, vkn: e.target.value })}
                    className="w-full rounded border border-[var(--ds-color-border)] px-3 py-2 text-sm focus:outline-none focus:border-[var(--ds-color-primary)]"
                    placeholder="10 veya 11 hane"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--ds-color-text)] mb-1">
                    Yetkili Kişi
                  </label>
                  <input
                    type="text"
                    value={formData.authorized_person}
                    onChange={(e) => setFormData({ ...formData, authorized_person: e.target.value })}
                    className="w-full rounded border border-[var(--ds-color-border)] px-3 py-2 text-sm focus:outline-none focus:border-[var(--ds-color-primary)]"
                    placeholder="Ad Soyad"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--ds-color-text)] mb-1">
                    Telefon
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded border border-[var(--ds-color-border)] px-3 py-2 text-sm focus:outline-none focus:border-[var(--ds-color-primary)]"
                    placeholder="05xxxxxxxxx"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--ds-color-text)] mb-1">
                    WhatsApp
                  </label>
                  <input
                    type="text"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full rounded border border-[var(--ds-color-border)] px-3 py-2 text-sm focus:outline-none focus:border-[var(--ds-color-primary)]"
                    placeholder="Bildirim için WhatsApp No"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[var(--ds-color-text)] mb-1">
                    E-Posta
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded border border-[var(--ds-color-border)] px-3 py-2 text-sm focus:outline-none focus:border-[var(--ds-color-primary)]"
                    placeholder="tebligat@sirketiniz.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--ds-color-text)] mb-1">
                    Sorgu Saati
                  </label>
                  <input
                    type="text"
                    value={formData.query_time}
                    onChange={(e) => setFormData({ ...formData, query_time: e.target.value })}
                    className="w-full rounded border border-[var(--ds-color-border)] px-3 py-2 text-sm focus:outline-none focus:border-[var(--ds-color-primary)]"
                    placeholder="Örn: 09:00"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--ds-color-text)] mb-1">
                    Durum
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as 'active' | 'inactive' | 'error',
                      })
                    }
                    className="w-full rounded border border-[var(--ds-color-border)] px-3 py-2 text-sm focus:outline-none focus:border-[var(--ds-color-primary)]"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Pasif</option>
                    <option value="error">Hata Durumu</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-[var(--ds-color-border)]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded px-4 py-2 text-sm font-medium text-[var(--ds-color-text-muted)] hover:bg-gray-100"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded bg-[var(--ds-color-primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--ds-color-primary-deep)] disabled:opacity-50"
                >
                  {loading ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
