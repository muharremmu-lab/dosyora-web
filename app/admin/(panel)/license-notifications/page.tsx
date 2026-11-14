import { AdminShell } from '@/components/admin'
import { LicenseNotificationsPanel } from '@/components/admin/license-notifications-panel'

export const dynamic = 'force-dynamic'

export default function LicenseNotificationsPage() {
  return (
    <AdminShell
      title="Lisans / Havale Bildirimleri"
      description="Kurumsal lisans havale bildirimlerini onaylayın veya reddedin. Havale bilgileri giriş yaptıktan sonra bu panelde görünür."
    >
      <LicenseNotificationsPanel />
    </AdminShell>
  )
}
