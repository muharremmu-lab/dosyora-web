import { AdminShell, StatCard } from '@/components/admin'
import {
  countAllContactMessages,
  countContactMessagesByStatus,
} from '@/lib/db/contact-messages'
import {
  countAllDemoAccounts,
  countDemoAccountsByStatus,
  countDemoAccountsLast7Days,
  countDemoAccountsPendingActivation,
  countDemoAccountsQuotaExhausted,
  countDemoAccountsToday,
} from '@/lib/db/demo-leads'

export default async function AdminDashboardPage() {
  const [
    totalDemoAccounts,
    activeDemoAccounts,
    todayDemoAccounts,
    disabledDemoAccounts,
    pendingActivation,
    quotaExhausted,
    last7Days,
    totalContactMessages,
    newContactMessages,
  ] = await Promise.all([
    countAllDemoAccounts(),
    countDemoAccountsByStatus('ACTIVE'),
    countDemoAccountsToday(),
    countDemoAccountsByStatus('DISABLED'),
    countDemoAccountsPendingActivation(),
    countDemoAccountsQuotaExhausted(),
    countDemoAccountsLast7Days(),
    countAllContactMessages(),
    countContactMessagesByStatus('NEW'),
  ])

  return (
    <AdminShell title="Dashboard" description="Demo talepleri ve iletişim mesajları özeti">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Toplam Demo Hesabı" value={totalDemoAccounts} />
        <StatCard label="Aktif Hesaplar" value={activeDemoAccounts} />
        <StatCard label="Bugünkü Demo Hesapları" value={todayDemoAccounts} />
        <StatCard label="Son 7 Gün Yeni Demo" value={last7Days} />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Aktivasyon Bekleyen" value={pendingActivation} />
        <StatCard label="Kotası Biten Demo" value={quotaExhausted} />
        <StatCard label="Devre Dışı Hesaplar" value={disabledDemoAccounts} />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <StatCard label="İletişim Formları" value={totalContactMessages} />
        <StatCard label="Yeni İletişim Mesajları" value={newContactMessages} />
      </div>
    </AdminShell>
  )
}
