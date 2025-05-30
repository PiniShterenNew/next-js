'use client'

import { useState, useEffect, useCallback } from 'react'
import { UserSettings, ApiResponse, UpdateUserSettingsData } from '@/types'
import { toast } from 'sonner'

interface UseSettingsReturn {
  settings: UserSettings | null
  loading: boolean
  error: string | null
  updateSettings: (data: UpdateUserSettingsData) => Promise<UserSettings | null>
  refetch: () => Promise<void>
}

export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch settings
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/settings')
      const data: ApiResponse<UserSettings> = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch settings')
      }

      if (data.success && data.data) {
        setSettings(data.data)
      } else {
        throw new Error(data.error || 'Failed to fetch settings')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      toast.error('Failed to load settings', {
        description: errorMessage
      })
    } finally {
      setLoading(false)
    }
  }, [])

  // Update settings
  const updateSettings = async (data: UpdateUserSettingsData): Promise<UserSettings | null> => {
    try {
      setError(null)

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result: ApiResponse<UserSettings> = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update settings')
      }

      if (result.success && result.data) {
        setSettings(result.data)
        toast.success('Settings updated successfully!')
        return result.data
      } else {
        throw new Error(result.error || 'Failed to update settings')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      toast.error('Failed to update settings', {
        description: errorMessage
      })
      return null
    }
  }

  // Refetch settings
  const refetch = async () => {
    await fetchSettings()
  }

  // Initial fetch
  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  return {
    settings,
    loading,
    error,
    updateSettings,
    refetch,
  }
}