// components/providers/theme-provider.tsx - Theme Provider עם Dark Mode
'use client'

import { useGlobalApp } from '@/context/AppContext'
import { createContext, useContext, useEffect, useState } from 'react'

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
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  const [systemTheme, setSystemTheme] = useState<'dark' | 'light'>('light')
  const [mounted, setMounted] = useState(false)
  
  // שימוש ב-Global App Context
  const { state: globalState, actions: globalActions } = useGlobalApp()

  // חישוב ה-theme האמיתי
  const actualTheme = theme === 'system' ? systemTheme : theme

  useEffect(() => {
    setMounted(true)
  }, [])

  // מעקב אחרי system theme
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light')
    }

    // בדיקה ראשונית
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light')
    
    // האזנה לשינויים
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // טעינת theme מ-localStorage או Global State
  useEffect(() => {
    if (!mounted) return

    const stored = localStorage.getItem(storageKey)
    const themeToUse = stored || globalState.theme || defaultTheme
    setTheme(themeToUse as Theme)
  }, [mounted, storageKey, defaultTheme, globalState.theme])

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
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
      // עדכון ב-Global State
      globalActions.setTheme(theme)
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

// Theme Toggle Component
export function ThemeToggle() {
  const { theme, setTheme, actualTheme } = useTheme()

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => setTheme('light')}
        className={`p-2 rounded-md transition-colors ${
          theme === 'light' 
            ? 'bg-primary text-primary-foreground' 
            : 'hover:bg-accent'
        }`}
        title="Light mode"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="m12 2 0 2" />
          <path d="m12 20 0 2" />
          <path d="m12 2 0 2" />
          <path d="m20.09 8.21 1.41 1.41" />
          <path d="m17.25 17.25 1.41 1.41" />
          <path d="m20.09 15.79 1.41-1.41" />
          <path d="m17.25 6.75 1.41-1.41" />
          <path d="m22 12-2 0" />
          <path d="m4 12-2 0" />
          <path d="m6.75 6.75-1.41-1.41" />
          <path d="m1.93 8.21 1.41 1.41" />
          <path d="m6.75 17.25-1.41 1.41" />
          <path d="m1.93 15.79 1.41-1.41" />
        </svg>
      </button>
      
      <button
        onClick={() => setTheme('dark')}
        className={`p-2 rounded-md transition-colors ${
          theme === 'dark' 
            ? 'bg-primary text-primary-foreground' 
            : 'hover:bg-accent'
        }`}
        title="Dark mode"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      </button>
      
      <button
        onClick={() => setTheme('system')}
        className={`p-2 rounded-md transition-colors ${
          theme === 'system' 
            ? 'bg-primary text-primary-foreground' 
            : 'hover:bg-accent'
        }`}
        title="System theme"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="14" height="8" x="5" y="2" rx="2" />
          <rect width="20" height="8" x="2" y="14" rx="2" />
          <path d="M6 18h2" />
          <path d="M12 18h6" />
        </svg>
      </button>
    </div>
  )
}

// Theme Switcher Dropdown Component
export function ThemeSwitcher() {
  const { theme, setTheme, actualTheme } = useTheme()

  return (
    <div className="relative">
      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value as Theme)}
        className="appearance-none bg-background border border-border rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <svg
          className="w-4 h-4 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  )
}