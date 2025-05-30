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
import { Search, Plus } from 'lucide-react'
import Link from 'next/link'
import { NotificationsDropdown } from './notifications-dropdown'

export function Header() {
  const { user } = useUser()

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
      <div className="flex items-center justify-between p-4">
        {/* Left side - Search and Quick Actions */}
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search invoices, customers..."
                className="pl-10 pr-4 py-2 w-64 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>

        {/* Right side - Actions and User */}
        <div className="flex items-center space-x-4">
          {/* Quick Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="hidden sm:flex">
                <Plus className="w-4 h-4 mr-2" />
                Create
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/invoices/new" className="cursor-pointer">
                  Create Invoice
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/customers/new" className="cursor-pointer">
                  Add Customer
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <NotificationsDropdown />

          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-muted-foreground">{user?.emailAddresses[0]?.emailAddress}</p>
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