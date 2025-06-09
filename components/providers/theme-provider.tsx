'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
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
  // טעינת theme מ-localStorage אם קיים
  const [systemTheme, setSystemTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window === 'undefined') return 'light'
    
    // טעינת theme מ-localStorage
    const savedTheme = localStorage.getItem(storageKey) as Theme | null
    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme
    }
    
    // בדיקת העדפת מערכת
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    return prefersDark ? 'dark' : 'light'
  })
  const [mounted, setMounted] = useState(false)
  
  // ניהול theme מקומי
  const [localTheme, setLocalThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'system'
    return (localStorage.getItem(storageKey) as Theme) || 'system'
  })
  
  // פונקציה לשינוי theme
  const setLocalTheme = useCallback((newTheme: Theme) => {
    setLocalThemeState(newTheme)
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, newTheme)
    }
  }, [storageKey])
  
  // שימוש ב-global theme אם קיים
  let theme = localTheme
  let setThemeFn = setLocalTheme
  
  // טעינת global theme אם אנחנו בתוך GlobalAppProvider
  try {
    const { state: globalState, actions } = useGlobalApp()
    if (globalState?.theme) {
      theme = globalState.theme as Theme
    }
    
    if (actions?.setTheme) {
      setThemeFn = (newTheme: Theme) => {
        actions.setTheme(newTheme)
      }
    }
  } catch (e) {
    // אם אין GlobalAppProvider, נמשיך עם ה-local theme
  }

  // חישוב ה-theme האמיתי
  const actualTheme = theme === 'system' ? systemTheme : theme as 'dark' | 'light'

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
    actualTheme: actualTheme as 'dark' | 'light',
    setTheme: setThemeFn,
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