import { beforeEach, describe, expect, it, vi } from 'vitest'

const dbQueryOne = vi.fn()
const dbQueryAll = vi.fn()
const dbRun = vi.fn()

vi.mock('@/lib/db/query', () => ({
  dbQueryOne,
  dbQueryAll,
  dbRun,
}))

describe('Users and Packages DB layer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    dbRun.mockResolvedValue({ rowsAffected: 1 })
  })

  it('creates a user and returns safe user data without password hash', async () => {
    const mockUser = {
      id: 'usr_test123',
      email: 'test@dosyora.com',
      password_hash: 'scrypt:salt:hash',
      full_name: 'Test Kullanıcı',
      role: 'user',
      status: 'active',
      created_at: '2026-11-18T10:00:00Z',
      updated_at: '2026-11-18T10:00:00Z',
    }

    dbQueryOne.mockResolvedValueOnce(mockUser)

    const { createUser } = await import('@/lib/db/users')
    const result = await createUser({
      email: 'test@dosyora.com',
      password: 'StrongPassword123!',
      full_name: 'Test Kullanıcı',
    })

    expect(result.id).toBe('usr_test123')
    expect(result.email).toBe('test@dosyora.com')
    expect(Reflect.get(result, 'password_hash')).toBeUndefined()
    expect(dbRun).toHaveBeenCalledWith(
      'users.create',
      expect.stringContaining('INSERT INTO users'),
      expect.any(Array),
    )
  })

  it('assigns and checks user packages', async () => {
    const { assignPackageToUser, userHasPackage, getUserActivePackageCodes } = await import(
      '@/lib/db/packages'
    )

    // assignPackageToUser
    dbQueryOne
      .mockResolvedValueOnce(null) // no existing
      .mockResolvedValueOnce({
        id: 'upk_1',
        user_id: 'usr_1',
        package_code: 'tebligat',
        status: 'active',
      })

    const assigned = await assignPackageToUser('usr_1', 'tebligat')
    expect(assigned.package_code).toBe('tebligat')

    // userHasPackage check
    dbQueryOne.mockResolvedValueOnce({ id: 'upk_1' })
    const hasTebligat = await userHasPackage('usr_1', 'tebligat')
    expect(hasTebligat).toBe(true)

    dbQueryOne.mockResolvedValueOnce(null)
    const hasIthalat = await userHasPackage('usr_1', 'ithalat')
    expect(hasIthalat).toBe(false)

    // getUserActivePackageCodes
    dbQueryAll.mockResolvedValueOnce([{ package_code: 'tebligat' }])
    const codes = await getUserActivePackageCodes('usr_1')
    expect(codes).toEqual(['tebligat'])
  })
})
