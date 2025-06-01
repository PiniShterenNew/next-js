'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useGlobalApp } from '@/context/AppContext'

type Theme = 'dark' | 'light' | 'system'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
  attribute?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

type ThemeProviderState = {
  theme: Theme
  systemTheme: 'dark' | 'light'
  actualTheme: 'dark' | 'light'
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: 'system',
  systemTheme: 'light',
  actualTheme: 'light',
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'invoice-pro-theme',
  attribute = 'class',
  enableSystem = true,
  disableTransitionOnChange = false,
  ...props
}: ThemeProviderProps) {
  const [systemTheme, setSystemTheme] = useState<'dark' | 'light'>('light')
  const [mounted, setMounted] = useState(false)
  
  // שימוש ב-Global App Context
  const { state: globalState, actions: globalActions } = useGlobalApp()
  const theme = globalState.theme as Theme

  // חישוב ה-theme האמיתי
  const actualTheme = theme === 'system' ? systemTheme : theme

  useEffect(() => {
    setMounted(true)
  }, [])

  // מעקב אחרי system theme
  useEffect(() => {
    if (!mounted) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light')
    }

    // בדיקה ראשונית
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light')
    
    // האזנה לשינויים
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [mounted])

  // החלת ה-theme על הDOM
  useEffect(() => {
    if (!mounted) return

    const root = window.document.documentElement

    root.classList.remove('light', 'dark')

    if (actualTheme === 'dark') {
      root.classList.add('dark')
      root.style.colorScheme = 'dark'
    } else {
      root.classList.add('light')
      root.style.colorScheme = 'light'
    }

    // אופציה לביטול transitions בזמן שינוי theme
    if (disableTransitionOnChange) {
      root.style.transition = 'none'
      setTimeout(() => {
        root.style.transition = ''
      }, 1)
    }
  }, [actualTheme, mounted, disableTransitionOnChange])

  const value = {
    theme,
    systemTheme,
    actualTheme,
    setTheme: (newTheme: Theme) => {
      globalActions.setTheme(newTheme)
    },
  }

  if (!mounted) {
    return null
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')

  return context
}