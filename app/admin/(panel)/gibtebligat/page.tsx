import { AdminShell } from '@/components/admin'
import { GibTebligatReports } from '@/components/admin/gibtebligat-reports'

export default function GibTebligatAdminPage() {
  return (
    <AdminShell
      title="GibTebligat Raporları"
      description="Kurulum indirmeleri, aktif demo kurulumları ve GİB hata telemetrisi"
    >
      <GibTebligatReports />
    </AdminShell>
  )
}
