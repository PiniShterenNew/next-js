'use client'

import { useGlobalApp } from '@/context/AppContext'
import { UpdateUserSettingsData, UserSettings } from '@/types'
import { toast } from 'sonner'

interface UseSettingsReturn {
  settings: UserSettings | null
  loading: boolean
  error: string | null
  updateSettings: (data: UpdateUserSettingsData) => Promise<UserSettings | null>
  refetch: () => Promise<void>
}

export function useSettings(): UseSettingsReturn {
  // השתמש ב-Global Context במקום local state
  const { state, actions } = useGlobalApp()

  const updateSettings = async (data: UpdateUserSettingsData) => {
    try {
      await actions.updateSettings(data)
      return state.settings
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred'
      toast.error('Failed to update settings', {
        description: errorMessage
      })
      return null
    }
  }

  const refetch = async () => {
    await actions.loadSettings()
  }

  return {
    settings: state.settings,
    loading: state.settingsLoading,
    error: null, // Global context handles errors internally
    updateSettings,
    refetch,
  }
}