// contexts/AppContext.tsx - Global State לנתונים קריטיים
'use client'

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { UserSettings } from '@/types'
import { useUser } from '@clerk/nextjs'

// Global State Types
interface GlobalAppState {
  // User & Settings
  settings: UserSettings | null
  settingsLoading: boolean
  
  // UI State
  theme: 'light' | 'dark' | 'system'
  sidebarOpen: boolean
  
  // Notifications
  unreadNotificationsCount: number
  
  // App State
  isOnline: boolean
  lastSync: Date | null
}

// Actions
type GlobalAppAction = 
  | { type: 'SET_SETTINGS'; payload: UserSettings }
  | { type: 'SET_SETTINGS_LOADING'; payload: boolean }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' | 'system' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR_OPEN'; payload: boolean }
  | { type: 'SET_UNREAD_COUNT'; payload: number }
  | { type: 'SET_ONLINE_STATUS'; payload: boolean }
  | { type: 'SET_LAST_SYNC'; payload: Date }
  | { type: 'RESET_STATE' }

// Initial State
const initialState: GlobalAppState = {
  settings: null,
  settingsLoading: false,
  theme: 'system',
  sidebarOpen: false,
  unreadNotificationsCount: 0,
  isOnline: true,
  lastSync: null,
}

// Reducer
function globalAppReducer(state: GlobalAppState, action: GlobalAppAction): GlobalAppState {
  switch (action.type) {
    case 'SET_SETTINGS':
      return { 
        ...state, 
        settings: action.payload, 
        settingsLoading: false,
        lastSync: new Date()
      }
    
    case 'SET_SETTINGS_LOADING':
      return { ...state, settingsLoading: action.payload }
    
    case 'SET_THEME':
      // שמירה ב-localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', action.payload)
      }
      return { ...state, theme: action.payload }
    
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen }
    
    case 'SET_SIDEBAR_OPEN':
      return { ...state, sidebarOpen: action.payload }
    
    case 'SET_UNREAD_COUNT':
      return { ...state, unreadNotificationsCount: action.payload }
    
    case 'SET_ONLINE_STATUS':
      return { ...state, isOnline: action.payload }
    
    case 'SET_LAST_SYNC':
      return { ...state, lastSync: action.payload }
    
    case 'RESET_STATE':
      return initialState
    
    default:
      return state
  }
}

// Context Type
interface GlobalAppContextType {
  state: GlobalAppState
  dispatch: React.Dispatch<GlobalAppAction>
  
  // Helper functions
  actions: {
    loadSettings: () => Promise<void>
    updateSettings: (settings: UserSettings) => Promise<void>
    setTheme: (theme: 'light' | 'dark' | 'system') => void
    toggleSidebar: () => void
    setSidebarOpen: (open: boolean) => void
    updateUnreadCount: (count: number) => void
    syncData: () => Promise<void>
  }
}

const GlobalAppContext = createContext<GlobalAppContextType | null>(null)

// Provider Component
export function GlobalAppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(globalAppReducer, initialState)
  const { user, isLoaded } = useUser()

  // Helper Actions
  const actions = {
    async loadSettings() {
      if (!user) return
      
      try {
        dispatch({ type: 'SET_SETTINGS_LOADING', payload: true })
        
        const response = await fetch('/api/settings')
        const data = await response.json()
        
        if (data.success && data.data) {
          dispatch({ type: 'SET_SETTINGS', payload: data.data })
        }
      } catch (error) {
        console.error('Failed to load settings:', error)
      } finally {
        dispatch({ type: 'SET_SETTINGS_LOADING', payload: false })
      }
    },

    async updateSettings(settings: UserSettings) {
      try {
        const response = await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settings)
        })
        
        const data = await response.json()
        
        if (data.success && data.data) {
          dispatch({ type: 'SET_SETTINGS', payload: data.data })
        }
      } catch (error) {
        console.error('Failed to update settings:', error)
        throw error
      }
    },

    setTheme(theme: 'light' | 'dark' | 'system') {
      dispatch({ type: 'SET_THEME', payload: theme })
    },

    toggleSidebar() {
      dispatch({ type: 'TOGGLE_SIDEBAR' })
    },

    setSidebarOpen(open: boolean) {
      dispatch({ type: 'SET_SIDEBAR_OPEN', payload: open })
    },

    updateUnreadCount(count: number) {
      dispatch({ type: 'SET_UNREAD_COUNT', payload: count })
    },

    async syncData() {
      // סנכרון נתונים קריטיים
      await Promise.all([
        actions.loadSettings(),
        // יכול להוסיף עוד נתונים קריטיים כאן
      ])
      dispatch({ type: 'SET_LAST_SYNC', payload: new Date() })
    }
  }

  // טעינת הגדרות משתמש בהתחלה
  useEffect(() => {
    if (isLoaded && user) {
      actions.loadSettings()
    }
  }, [isLoaded, user])

  // טעינת theme מ-localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null
      if (savedTheme) {
        dispatch({ type: 'SET_THEME', payload: savedTheme })
      }
    }
  }, [])

  // מעקב אחרי סטטוס אינטרנט
  useEffect(() => {
    function handleOnline() {
      dispatch({ type: 'SET_ONLINE_STATUS', payload: true })
      // סנכרון אוטומטי כשחוזרים אונליין
      actions.syncData()
    }

    function handleOffline() {
      dispatch({ type: 'SET_ONLINE_STATUS', payload: false })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // איפוס state כשמשתמש מתנתק
  useEffect(() => {
    if (isLoaded && !user) {
      dispatch({ type: 'RESET_STATE' })
    }
  }, [isLoaded, user])

  const value: GlobalAppContextType = {
    state,
    dispatch,
    actions
  }

  return (
    <GlobalAppContext.Provider value={value}>
      {children}
    </GlobalAppContext.Provider>
  )
}

// Custom Hook
export function useGlobalApp() {
  const context = useContext(GlobalAppContext)
  if (!context) {
    throw new Error('useGlobalApp must be used within a GlobalAppProvider')
  }
  return context
}

// Specialized Hooks
export function useAppSettings() {
  const { state, actions } = useGlobalApp()
  return {
    settings: state.settings,
    loading: state.settingsLoading,
    updateSettings: actions.updateSettings,
    reload: actions.loadSettings
  }
}

export function useAppTheme() {
  const { state, actions } = useGlobalApp()
  return {
    theme: state.theme,
    setTheme: actions.setTheme
  }
}

export function useAppSidebar() {
  const { state, actions } = useGlobalApp()
  return {
    isOpen: state.sidebarOpen,
    toggle: actions.toggleSidebar,
    setOpen: actions.setSidebarOpen
  }
}

export function useAppNotifications() {
  const { state, actions } = useGlobalApp()
  return {
    unreadCount: state.unreadNotificationsCount,
    updateCount: actions.updateUnreadCount
  }
}