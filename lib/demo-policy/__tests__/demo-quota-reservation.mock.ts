import {
  getDocumentLimitForAttemptCount,
  isDemoRepeatQuotaExceeded,
  resolveEffectiveDemoAttemptCount,
} from '@/lib/demo-policy/repeat-policy'

export function createDemoQuotaReservationMock() {
  const emailQuotaState = new Map<string, number>()
  const ipQuotaState = new Map<string, number>()
  let reservationQueue: Promise<void> = Promise.resolve()

  async function reserveDemoAttemptQuota(
    email: string,
    ipAddress: string,
  ): Promise<
    | { reserved: true; documentLimit: number }
    | { reserved: false; reason: 'exceeded' }
  > {
    let result:
      | { reserved: true; documentLimit: number }
      | { reserved: false; reason: 'exceeded' }

    const run = () => {
      const normalizedEmail = email.trim().toLowerCase()
      const emailCount = emailQuotaState.get(normalizedEmail) ?? 0
      const ipCount = ipQuotaState.get(ipAddress) ?? 0

      if (isDemoRepeatQuotaExceeded(emailCount, ipCount)) {
        result = { reserved: false, reason: 'exceeded' }
        return
      }

      const documentLimit = getDocumentLimitForAttemptCount(
        resolveEffectiveDemoAttemptCount(emailCount, ipCount),
      )
      if (documentLimit == null) {
        result = { reserved: false, reason: 'exceeded' }
        return
      }

      emailQuotaState.set(normalizedEmail, emailCount + 1)
      ipQuotaState.set(ipAddress, ipCount + 1)
      result = { reserved: true, documentLimit }
    }

    const current = reservationQueue.then(run)
    reservationQueue = current.then(
      () => undefined,
      () => undefined,
    )
    await current
    return result!
  }

  async function releaseDemoAttemptQuota(email: string, ipAddress: string) {
    const normalizedEmail = email.trim().toLowerCase()
    emailQuotaState.set(
      normalizedEmail,
      Math.max(0, (emailQuotaState.get(normalizedEmail) ?? 1) - 1),
    )
    ipQuotaState.set(ipAddress, Math.max(0, (ipQuotaState.get(ipAddress) ?? 1) - 1))
  }

  function reset() {
    emailQuotaState.clear()
    ipQuotaState.clear()
    reservationQueue = Promise.resolve()
  }

  function seed(input: { email?: string; ip?: string; count: number }) {
    if (input.email) {
      emailQuotaState.set(input.email.trim().toLowerCase(), input.count)
    }
    if (input.ip) {
      ipQuotaState.set(input.ip, input.count)
    }
  }

  return {
    emailQuotaState,
    ipQuotaState,
    reserveDemoAttemptQuota,
    releaseDemoAttemptQuota,
    reset,
    seed,
  }
}
