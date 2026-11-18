'use client'

import { useState } from 'react'
import {
  UserPlus,
  Shield,
  Check,
  X,
  Trash2,
  CheckCircle2,
} from 'lucide-react'

import { cn } from '@/lib/design-system/cn'
import { KNOWN_PACKAGES } from '@/lib/packages-config'

type UserData = {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'user'
  status: 'active' | 'inactive' | 'suspended'
  created_at: string
  packages: string[]
}

type AdminUsersPanelProps = {
  initialUsers: UserData[]
}

export function AdminUsersPanel({ initialUsers }: AdminUsersPanelProps) {
  const [users, setUsers] = useState<UserData[]>(initialUsers)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [savingPackagesUserId, setSavingPackagesUserId] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'user' as 'admin' | 'user',
    packages: [] as string[],
  })

  const toggleFormPackage = (code: string) => {
    setFormData((prev) => ({
      ...prev,
      packages: prev.packages.includes(code)
        ? prev.packages.filter((c) => c !== code)
        : [...prev.packages, code],
    }))
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Kullanıcı oluşturulamadı.')

      setUsers((prev) => [data.user as UserData, ...prev])
      setIsAddModalOpen(false)
      setFormData({
        full_name: '',
        email: '',
        password: '',
        role: 'user',
        packages: [],
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Hata oluştu.'
      setErrorMsg(message)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleUserPackage = async (userId: string, packageCode: string, currentActive: boolean) => {
    setSavingPackagesUserId(userId)
    try {
      const method = currentActive ? 'DELETE' : 'POST'
      const res = await fetch(`/api/admin/users/${userId}/packages`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ package_code: packageCode }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Paket güncellenemedi.')

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, packages: data.activePackages } : u)),
      )
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Paket yetkisi güncellenirken hata oluştu.'
      alert(message)
    } finally {
      setSavingPackagesUserId(null)
    }
  }

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`"${name}" kullanıcısını ve tüm paket yetkilerini silmek istediğinize emin misiniz?`)) {
      return
    }

    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Silinemedi')
      setUsers((prev) => prev.filter((u) => u.id !== id))
    } catch {
      alert('Kullanıcı silinirken hata oluştu.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--ds-color-border)] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--ds-color-text)]">
              Kullanıcı ve Paket Yönetimi
            </h1>
            <span className="rounded bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5">
              Admin Yetkisi
            </span>
          </div>
          <p className="mt-1 text-sm text-[var(--ds-color-text-muted)]">
            Tüm kullanıcıları görüntüleyin, yeni kullanıcı tanımlayın ve modül paketlerini (Tebligat, Belge Okuma, İthalat, Akıllı Ofis) anında yönetin.
          </p>
        </div>
        <button
          onClick={() => {
            setErrorMsg(null)
            setIsAddModalOpen(true)
          }}
          className="inline-flex items-center justify-center gap-2 rounded-[var(--ds-radius-md)] bg-[var(--ds-color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--ds-color-primary-deep)] ds-transition-hover"
        >
          <UserPlus className="h-4 w-4" />
          <span>Yeni Kullanıcı Tanımla</span>
        </button>
      </div>

      {/* Users & Package Assignment Table */}
      <div className="overflow-hidden rounded-[var(--ds-radius-lg)] border border-[var(--ds-color-border)] bg-[var(--ds-color-surface)] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[var(--ds-color-text)]">
            <thead className="border-b border-[var(--ds-color-border)] bg-[var(--ds-color-surface-alt)] text-xs font-semibold uppercase tracking-wider text-[var(--ds-color-text-muted)]">
              <tr>
                <th scope="col" className="px-4 py-3.5">Kullanıcı Bilgisi</th>
                <th scope="col" className="px-4 py-3.5">Rol</th>
                <th scope="col" className="px-4 py-3.5">Tebligat</th>
                <th scope="col" className="px-4 py-3.5">Belge Okuma</th>
                <th scope="col" className="px-4 py-3.5">İthalat</th>
                <th scope="col" className="px-4 py-3.5">Akıllı Ofis</th>
                <th scope="col" className="px-4 py-3.5 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--ds-color-border)]">
              {users.map((u) => {
                const isAdmin = u.role === 'admin'
                const isSaving = savingPackagesUserId === u.id

                return (
                  <tr key={u.id} className="hover:bg-[var(--ds-color-surface-alt)] ds-transition-hover">
                    {/* Kullanıcı */}
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-[var(--ds-color-text)]">{u.full_name}</div>
                      <div className="text-xs text-[var(--ds-color-text-muted)] font-mono">{u.email}</div>
                    </td>

                    {/* Rol */}
                    <td className="px-4 py-3.5">
                      {isAdmin ? (
                        <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
                          <Shield className="h-3 w-3" />
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                          Kullanıcı
                        </span>
                      )}
                    </td>

                    {/* Paket Butonları (Tebligat, Belge Okuma, İthalat, Akıllı Ofis) */}
                    {(['tebligat', 'belge_okuma', 'ithalat', 'akilli_ofis'] as const).map((pkgCode) => {
                      const hasPkg = isAdmin || u.packages.includes(pkgCode)

                      return (
                        <td key={pkgCode} className="px-4 py-3.5">
                          {isAdmin ? (
                            <span className="inline-flex items-center gap-1 text-xs text-amber-700 font-medium">
                              <CheckCircle2 className="h-4 w-4 text-amber-600" />
                              Tüm Yetkiler
                            </span>
                          ) : (
                            <button
                              disabled={isSaving}
                              onClick={() => handleToggleUserPackage(u.id, pkgCode, hasPkg)}
                              className={cn(
                                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ds-transition-hover',
                                hasPkg
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-700',
                              )}
                              title={hasPkg ? 'Paketi Kaldır' : 'Paketi Tanımla'}
                            >
                              {hasPkg ? (
                                <>
                                  <Check className="h-3 w-3" />
                                  <span>Aktif</span>
                                </>
                              ) : (
                                <>
                                  <X className="h-3 w-3" />
                                  <span>Pasif</span>
                                </>
                              )}
                            </button>
                          )}
                        </td>
                      )
                    })}

                    {/* Sil */}
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => handleDeleteUser(u.id, u.full_name)}
                        className="rounded p-1.5 text-xs text-red-600 hover:bg-red-50"
                        title="Kullanıcıyı Sil"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* New User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-[var(--ds-radius-lg)] bg-[var(--ds-color-surface)] p-6 shadow-xl border border-[var(--ds-color-border)]">
            <h2 className="text-lg font-bold text-[var(--ds-color-text)] mb-4">
              Yeni Kullanıcı Oluştur
            </h2>

            {errorMsg && (
              <div className="mb-4 rounded bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--ds-color-text)] mb-1">
                  Ad Soyad *
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full rounded border border-[var(--ds-color-border)] px-3 py-2 text-sm focus:outline-none focus:border-[var(--ds-color-primary)]"
                  placeholder="Ahmet Yılmaz"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--ds-color-text)] mb-1">
                  E-Posta *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded border border-[var(--ds-color-border)] px-3 py-2 text-sm focus:outline-none focus:border-[var(--ds-color-primary)]"
                  placeholder="kullanici@dosyora.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--ds-color-text)] mb-1">
                  Şifre * (En az 10 karakter)
                </label>
                <input
                  type="password"
                  required
                  minLength={10}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full rounded border border-[var(--ds-color-border)] px-3 py-2 text-sm focus:outline-none focus:border-[var(--ds-color-primary)]"
                  placeholder="••••••••••"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--ds-color-text)] mb-1">
                  Rol
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'user' })}
                  className="w-full rounded border border-[var(--ds-color-border)] px-3 py-2 text-sm focus:outline-none focus:border-[var(--ds-color-primary)]"
                >
                  <option value="user">Standart Kullanıcı</option>
                  <option value="admin">Yönetici (Admin)</option>
                </select>
              </div>

              {formData.role !== 'admin' && (
                <div>
                  <label className="block text-xs font-semibold text-[var(--ds-color-text)] mb-2">
                    Başlangıç Paketleri
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {KNOWN_PACKAGES.map((pkg) => {
                      const checked = formData.packages.includes(pkg.code)
                      return (
                        <label
                          key={pkg.code}
                          className={cn(
                            'flex items-center gap-2 rounded border p-2.5 text-xs font-medium cursor-pointer ds-transition-hover',
                            checked
                              ? 'border-blue-500 bg-blue-50 text-blue-900'
                              : 'border-[var(--ds-color-border)] bg-[var(--ds-color-surface-alt)] text-[var(--ds-color-text)]',
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleFormPackage(pkg.code)}
                            className="rounded text-blue-600"
                          />
                          <span>{pkg.name}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-[var(--ds-color-border)]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded px-4 py-2 text-sm font-medium text-[var(--ds-color-text-muted)] hover:bg-gray-100"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded bg-[var(--ds-color-primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--ds-color-primary-deep)] disabled:opacity-50"
                >
                  {loading ? 'Oluşturuluyor...' : 'Kullanıcıyı Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
