import { dbQueryOne, dbRun } from './query'

export type DownloadSource = 'home' | 'indir'

type CountRow = { count?: number | bigint }

function asNumber(value: number | bigint | undefined): number {
  if (typeof value === 'bigint') return Number(value)
  return Number(value ?? 0)
}

export function istanbulStartIso(daysBack: number): string {
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
  const [year, month, day] = today.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day - daysBack, -3, 0, 0)).toISOString()
}

export async function recordDownload(source: DownloadSource): Promise<void> {
  await dbRun(
    'downloadLogs.insert',
    'INSERT INTO download_logs (created_at, source) VALUES (?, ?)',
    [new Date().toISOString(), source],
  )
}

async function countSince(since: string | null): Promise<number> {
  const row = await dbQueryOne<CountRow>(
    since ? 'downloadLogs.countSince' : 'downloadLogs.countAll',
    since
      ? 'SELECT COUNT(*) AS count FROM download_logs WHERE created_at >= ?'
      : 'SELECT COUNT(*) AS count FROM download_logs',
    since ? [since] : undefined,
  )
  return asNumber(row?.count)
}

export async function downloadCounts(): Promise<{ today: number; last7Days: number; total: number }> {
  const [today, last7Days, total] = await Promise.all([
    countSince(istanbulStartIso(0)),
    countSince(istanbulStartIso(6)),
    countSince(null),
  ])
  return { today, last7Days, total }
}
