// app/sso-callback/page.tsx
import { AuthenticateWithRedirectCallback, useAuth } from '@clerk/nextjs'
import { useEffect } from 'react'
import { fetchWithAuth } from '@/lib/fetchWithAuth'

export default function SSOCallback() {
  const { isLoaded, userId } = useAuth()

  useEffect(() => {
    if (isLoaded && userId) {
      fetchWithAuth('/api/ensure-user', { method: 'POST' })
    }
  }, [isLoaded, userId])

  return <AuthenticateWithRedirectCallback />
}