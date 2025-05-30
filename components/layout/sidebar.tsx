'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  Menu,
  Receipt,
  Plus
} from 'lucide-react'

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Invoices',
    href: '/dashboard/invoices',
    icon: FileText,
    children: [
      {
        title: 'All Invoices',
        href: '/dashboard/invoices',
        icon: Receipt,
      },
      {
        title: 'Create Invoice',
        href: '/dashboard/invoices/new',
        icon: Plus,
      },
    ],
  },
  {
    title: 'Customers',
    href: '/dashboard/customers',
    icon: Users,
    children: [
      {
        title: 'All Customers',
        href: '/dashboard/customers',
        icon: Users,
      },
      {
        title: 'Add Customer',
        href: '/dashboard/customers/new',
        icon: Plus,
      },
    ],
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Receipt className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold">InvoicePro</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {sidebarItems.map((item) => (
          <SidebarItem 
            key={item.href} 
            item={item} 
            pathname={pathname}
            onItemClick={() => setIsOpen(false)}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          Invoice Management System
        </p>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden fixed top-4 left-4 z-40"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 border-r border-border bg-card">
        <SidebarContent />
      </div>
    </>
  )
}

interface SidebarItemProps {
  item: typeof sidebarItems[0]
  pathname: string
  onItemClick: () => void
}

function SidebarItem({ item, pathname, onItemClick }: SidebarItemProps) {
  const [isExpanded, setIsExpanded] = useState(
    item.children ? item.children.some(child => pathname === child.href) : false
  )

  const isActive = pathname === item.href || 
    (item.children && item.children.some(child => pathname === child.href))

  if (item.children) {
    return (
      <div className="space-y-1">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            isActive 
              ? "bg-primary text-primary-foreground" 
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          )}
        >
          <div className="flex items-center space-x-3">
            <item.icon className="w-4 h-4" />
            <span>{item.title}</span>
          </div>
          <div className={cn(
            "transition-transform",
            isExpanded ? "rotate-90" : ""
          )}>
            ▶
          </div>
        </button>
        
        {isExpanded && (
          <div className="ml-4 space-y-1">
            {item.children.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                onClick={onItemClick}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === child.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <child.icon className="w-4 h-4" />
                <span>{child.title}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Link
      href={item.href}
      onClick={onItemClick}
      className={cn(
        "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
        pathname === item.href
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-accent"
      )}
    >
      <item.icon className="w-4 h-4" />
      <span>{item.title}</span>
    </Link>
  )
}