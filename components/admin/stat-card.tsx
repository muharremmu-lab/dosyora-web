import { Card } from '@/components/ui'

type StatCardProps = {
  label: string
  value: number | string
}

export function StatCard({ label, value }: StatCardProps) {
  return (
    <Card>
      <p className="text-sm text-[var(--ds-color-text-muted)]">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-[var(--ds-color-text)]">{value}</p>
    </Card>
  )
}
