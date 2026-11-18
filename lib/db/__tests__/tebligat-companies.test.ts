import { beforeEach, describe, expect, it, vi } from 'vitest'

const dbQueryOne = vi.fn()
const dbQueryAll = vi.fn()
const dbRun = vi.fn()

vi.mock('@/lib/db/query', () => ({
  dbQueryOne,
  dbQueryAll,
  dbRun,
}))

describe('Tebligat Companies DB layer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    dbRun.mockResolvedValue({ rowsAffected: 1 })
  })

  it('creates a tebligat company with all required fields', async () => {
    const mockCompany = {
      id: 'tco_123',
      user_id: 'usr_abc',
      company_name: 'Anadolu Dış Ticaret Ltd.',
      vkn: '1234567890',
      authorized_person: 'Mehmet Yılmaz',
      phone: '05321112233',
      whatsapp: '05321112233',
      email: 'muhasebe@anadolu.com',
      query_time: '09:00',
      status: 'active',
      last_query_at: null,
      created_at: '2026-11-18T10:00:00Z',
      updated_at: '2026-11-18T10:00:00Z',
    }

    dbQueryOne.mockResolvedValueOnce(mockCompany)

    const { createTebligatCompany } = await import('@/lib/db/tebligat-companies')
    const company = await createTebligatCompany({
      user_id: 'usr_abc',
      company_name: 'Anadolu Dış Ticaret Ltd.',
      vkn: '1234567890',
      authorized_person: 'Mehmet Yılmaz',
      phone: '05321112233',
      whatsapp: '05321112233',
      email: 'muhasebe@anadolu.com',
      query_time: '09:00',
      status: 'active',
    })

    expect(company.company_name).toBe('Anadolu Dış Ticaret Ltd.')
    expect(company.vkn).toBe('1234567890')
    expect(company.authorized_person).toBe('Mehmet Yılmaz')
    expect(company.query_time).toBe('09:00')
    expect(company.status).toBe('active')
    expect(dbRun).toHaveBeenCalledWith(
      'tebligat_companies.insert',
      expect.stringContaining('INSERT INTO tebligat_companies'),
      expect.any(Array),
    )
  })

  it('triggers manual tebligat query and updates last_query_at', async () => {
    const existing = {
      id: 'tco_123',
      company_name: 'Anadolu Dış Ticaret Ltd.',
      vkn: '1234567890',
      last_query_at: null,
    }

    const updated = {
      ...existing,
      last_query_at: '2026-11-18T12:00:00Z',
    }

    dbQueryOne
      .mockResolvedValueOnce(existing)
      .mockResolvedValueOnce(updated)

    const { triggerTebligatQuery } = await import('@/lib/db/tebligat-companies')
    const result = await triggerTebligatQuery('tco_123')

    expect(result?.last_query_at).toBe('2026-11-18T12:00:00Z')
    expect(dbRun).toHaveBeenCalledWith(
      'tebligat_companies.triggerQuery',
      expect.stringContaining('UPDATE tebligat_companies SET last_query_at'),
      expect.any(Array),
    )
  })

  it('lists companies with search and filters', async () => {
    dbQueryAll.mockResolvedValueOnce([
      {
        id: 'tco_1',
        company_name: 'Kaya Mimarlık',
        vkn: '9876543210',
        status: 'active',
      },
    ])

    const { listTebligatCompanies } = await import('@/lib/db/tebligat-companies')
    const list = await listTebligatCompanies({ search: 'Kaya', status: 'active' })

    expect(list).toHaveLength(1)
    expect(list[0].company_name).toBe('Kaya Mimarlık')
  })
})
