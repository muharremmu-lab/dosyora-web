import { AdminShell, StatCard } from '@/components/admin'
import {
  countAllContactMessages,
  countContactMessagesByStatus,
} from '@/lib/db/contact-messages'
import {
  countAllDemoAccounts,
  countDemoAccountsByStatus,
  countDemoAccountsToday,
} from '@/lib/db/demo-leads'

export default function AdminDashboardPage() {
  const stats = {
    totalDemoAccounts: countAllDemoAccounts(),
    activeDemoAccounts: countDemoAccountsByStatus('ACTIVE'),
    todayDemoAccounts: countDemoAccountsToday(),
    disabledDemoAccounts: countDemoAccountsByStatus('DISABLED'),
    totalContactMessages: countAllContactMessages(),
    newContactMessages: countContactMessagesByStatus('NEW'),
  }

  return (
    <AdminShell title="Dashboard" description="Demo hesapları ve iletişim mesajları özeti">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Toplam Demo Hesabı" value={stats.totalDemoAccounts} />
        <StatCard label="Aktif Hesaplar" value={stats.activeDemoAccounts} />
        <StatCard label="Bugünkü Demo Hesapları" value={stats.todayDemoAccounts} />
        <StatCard label="Devre Dışı Hesaplar" value={stats.disabledDemoAccounts} />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <StatCard label="İletişim Formları" value={stats.totalContactMessages} />
        <StatCard label="Yeni İletişim Mesajları" value={stats.newContactMessages} />
      </div>
    </AdminShell>
  )
}
