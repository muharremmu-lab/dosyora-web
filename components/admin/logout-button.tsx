'use client'

import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui'

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <Button type="button" variant="outline" onClick={handleLogout} aria-label="Admin oturumunu kapat">
      Çıkış
    </Button>
  )
}
