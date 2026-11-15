import { AdminShell } from '@/components/admin'
import { LicenseNotificationsPanel } from '@/components/admin/license-notifications-panel'

export const dynamic = 'force-dynamic'

export default function LicenseNotificationsPage() {
  return (
    <AdminShell
      title="Lisans / Havale Bildirimleri"
      description="Masaüstü uygulamadan gelen bekleyen lisans taleplerini onaylayın veya reddedin. Onay, donanım kimliğine bağlı lisans anahtarı üretir."
    >
      <LicenseNotificationsPanel />
    </AdminShell>
  )
}
