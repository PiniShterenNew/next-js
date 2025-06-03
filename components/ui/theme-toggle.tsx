'use client'

import { useTheme } from '@/components/providers/theme-provider'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Moon, Sun, Monitor } from 'lucide-react'
import { useTranslation } from '@/hooks/use-translation'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const translation = useTranslation()
  const t = translation.t
  const pathname = usePathname()

  // Check if the current locale is RTL
  const isRtl = pathname.includes('/he')

  // Adjust icon margin based on RTL
  const iconClass = isRtl ? 'h-4 w-4' : 'h-4 w-4'

  // Function to render the appropriate icon based on the current theme
  const iconRender = (currentTheme: string) => {
    switch (currentTheme) {
      case 'light':
        return <Sun className={iconClass} />
      case 'dark':
        return <Moon className={iconClass} />
      case 'system':
        return <Monitor className={iconClass} />
      default:
        return <Sun className={iconClass} />
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className=" md:h-9 md:w-9 w-auto px-4 md:px-0">
         {iconRender(theme)}
          <span className="sr-only">{t('settings.appearance')}</span>
          <span className='md:hidden'>{t('settings.appearance')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className={cn(theme === 'light' ? 'bg-accent font-medium' : '')}
        >
          <Sun className={iconClass} />
          <span>{t('theme.light')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className={cn(theme === 'dark' ? 'bg-accent font-medium' : '')}
        >
          <Moon className={iconClass} />
          <span>{t('theme.dark')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('system')}
          className={cn(theme === 'system' ? 'bg-accent font-medium' : '')}
        >
          <Monitor className={iconClass} />
          <span>{t('theme.system')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Simple toggle button (alternative)
export function SimpleThemeToggle() {
  const { actualTheme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(actualTheme === 'dark' ? 'light' : 'dark')}
      className="h-9 w-9"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}