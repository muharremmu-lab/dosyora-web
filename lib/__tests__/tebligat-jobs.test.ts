import { beforeEach, describe, expect, it, vi } from 'vitest'

const dbQueryOne = vi.fn()
const dbQueryAll = vi.fn()
const dbRun = vi.fn()

vi.mock('@/lib/db/query', () => ({
  dbQueryOne,
  dbQueryAll,
  dbRun,
}))

vi.mock('@/lib/db/tebligat-companies', () => ({
  getTebligatCompanyById: vi.fn(async () => ({
    id: 'tco_1',
    user_id: 'user_1',
    company_name: 'Ornek Ltd',
    vkn: '1234567890',
    authorized_person: null,
    phone: '5551112233',
    whatsapp: '5551112233',
    email: 'firma@example.com',
    query_time: '09:30',
    status: 'active',
    last_query_at: null,
    created_at: '2026-11-19T00:00:00.000Z',
    updated_at: '2026-11-19T00:00:00.000Z',
  })),
}))

describe('tebligat jobs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    dbRun.mockResolvedValue({ rowsAffected: 1 })
  })

  it('stores contact fields and never a GIB password', async () => {
    const { createTebligatJob } = await import('@/lib/db/tebligat-jobs')
    dbQueryOne.mockResolvedValueOnce({
      id: 'job_1',
      vkn: '1234567890',
      company_name: 'Ornek Ltd',
      status: 'PENDING',
    })

    await createTebligatJob('tco_1')

    const insertCall = dbRun.mock.calls.find((call) => call[0] === 'tebligat_jobs.insert')
    expect(insertCall).toBeTruthy()
    const sql = String(insertCall?.[1])
    const args = insertCall?.[2] as unknown[]
    expect(sql.toLowerCase()).not.toContain('password')
    expect(sql.toLowerCase()).not.toContain('sifre')
    expect(args).toContain('1234567890')
    expect(args).toContain('firma@example.com')
    expect(args).not.toContain('gib-secret')
  })
})
