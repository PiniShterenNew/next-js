// components/layout/header.tsx
'use client'

import { UserButton, useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { NotificationsDropdown } from './notifications-dropdown'
import { ThemeToggle } from '../ui/theme-toggle'
import { Search } from './search'
import { LanguageSwitcher } from '@/components/language-switcher'
import { MobileNav } from './mobile-nav'
import { useTranslation } from '@/hooks/use-translation'

export function Header() {
  const { user } = useUser()
  const { t } = useTranslation()

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
      <div className="flex items-center justify-between p-4">
        {/* Left side - Search and Quick Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2">
            <Search />
          </div>
        </div>

        {/* Right side - Actions and User */}
        <div className="flex items-center gap-4">
          {/* Quick Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="hidden sm:flex rtl:flex-row-reverse items-center justify-center">
                <Plus className="w-4 h-4" />
                {t('common.create')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rtl:text-right">
              <DropdownMenuLabel>{t('quickActions')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/invoices/new" className="cursor-pointer">
                  {t('invoice.new')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/customers/new" className="cursor-pointer">
                  {t('customer.new')}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            <LanguageSwitcher />
            <NotificationsDropdown />
          </div>

          {/* Mobile navigation */}
          <div className="md:hidden">
            <MobileNav />
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium m-0">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-muted-foreground m-0">{user?.emailAddresses[0]?.emailAddress}</p>
            </div>
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8"
                }
              }}
              afterSignOutUrl="/sign-in"
            />
          </div>
        </div>
      </div>
    </header>
  )
}