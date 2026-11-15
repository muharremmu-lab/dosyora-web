import { FeedbackPanel } from '@/components/admin/feedback-panel'
import { AdminShell } from '@/components/admin'

export default function FeedbackAdminPage() {
  return (
    <AdminShell
      title="Öneri ve bildirimler"
      description="Siteden gelen öneri, istek ve şikayetleri okuyun veya arşivleyin."
    >
      <FeedbackPanel />
    </AdminShell>
  )
}
