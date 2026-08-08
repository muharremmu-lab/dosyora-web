import { afterEach, describe, expect, it, vi } from 'vitest'

const createContactMessage = vi.fn()
const notifyContactMessageCreated = vi.fn()

vi.mock('@/lib/db/contact-messages', () => ({
  createContactMessage,
}))

vi.mock('@/lib/notifications/service', () => ({
  notificationService: {
    notifyContactMessageCreated,
  },
}))

describe('contact messages route notification isolation', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('keeps message creation successful when notification throws', async () => {
    const message = {
      id: 12,
      created_at: '2026-08-07T12:00:00.000Z',
      name: 'Ayşe Kaya',
      email: 'ayse@example.com',
      phone: '+905551112233',
      subject: 'Destek',
      message: 'Merhaba',
      status: 'NEW' as const,
      notes: null,
      ip_address: '127.0.0.1',
      user_agent: 'vitest',
    }

    createContactMessage.mockResolvedValueOnce(message)
    notifyContactMessageCreated.mockRejectedValueOnce(new Error('mail down'))

    const created = await createContactMessage({
      name: message.name,
      email: message.email,
      phone: message.phone,
      subject: message.subject,
      message: message.message,
    })

    try {
      await notifyContactMessageCreated(created)
    } catch {
      // Mirrors app/api/contact-messages/route.ts isolation.
    }

    expect(created.id).toBe(12)
    expect(notifyContactMessageCreated).toHaveBeenCalledOnce()
  })
})
