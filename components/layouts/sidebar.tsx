// components/layout/sidebar.tsx - עדכון עם התראות
'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useUnreadNotificationsCount } from '@/hooks/use-notifications'
import { useTranslation } from '@/hooks/use-translation'
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  Menu,
  Receipt,
  Plus,
  Bell
} from 'lucide-react'
import { useLocale } from 'next-intl'

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
    title: 'Notifications',
    href: '/dashboard/notifications',
    icon: Bell,
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
  const { unreadCount } = useUnreadNotificationsCount()
  const { t } = useTranslation()

  const sidebarItems = useMemo(() => [
    {
      title: t('navigation.dashboard'),
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: t('navigation.invoices'),
      href: '/dashboard/invoices',
      icon: FileText,
      children: [
        {
          title: t('navigation.allInvoices'),
          href: '/dashboard/invoices',
          icon: Receipt,
        },
        {
          title: t('navigation.createInvoice'),
          href: '/dashboard/invoices/new',
          icon: Plus,
        },
      ],
    },
    {
      title: t('navigation.customers'),
      href: '/dashboard/customers',
      icon: Users,
      children: [
        {
          title: t('navigation.allCustomers'),
          href: '/dashboard/customers',
          icon: Users,
        },
        {
          title: t('navigation.addCustomer'),
          href: '/dashboard/customers/new',
          icon: Plus,
        },
      ],
    },
    {
      title: t('navigation.notifications'),
      href: '/dashboard/notifications',
      icon: Bell,
    },
    {
      title: t('navigation.settings'),
      href: '/dashboard/settings',
      icon: Settings,
    },
  ], [t])

  const SidebarContent = () => (
    <div className="flex flex-col h-full border-l border-border bg-card">
      {/* Logo */}
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Receipt className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold">{t('appName')}</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col flex-1 p-4 gap-2">
        {sidebarItems.map((item) => (
          <SidebarItem
            key={item.href}
            item={item}
            pathname={pathname}
            unreadCount={item.title === t('navigation.notifications') ? unreadCount : undefined}
            onItemClick={() => setIsOpen(false)}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4">
        <p className="text-xs text-muted-foreground text-center">
          {t('footer.copyright')}
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

interface SidebarItem {
  title: string
  href: string
  icon: React.ElementType
  children?: Array<{
    title: string
    href: string
    icon: React.ElementType
  }>
}

interface SidebarItemProps {
  item: SidebarItem
  pathname: string
  unreadCount?: number
  onItemClick: () => void
}

function normalizePath(path: string, locale: string) {
  // מסיר את הקידומת (למשל /he/ או /en/) מהנתיב
  return path.startsWith(`/${locale}/`)
    ? path.replace(`/${locale}`, '')
    : path === `/${locale}`
      ? '/'
      : path;
}

export function SidebarItem({ item, pathname, unreadCount, onItemClick }: SidebarItemProps) {
  const locale = useLocale();
  const normalizedPath = normalizePath(pathname, locale);
  const isRtl = locale === 'he';

  const [isExpanded, setIsExpanded] = useState(
    item.children ? item.children.some(child => normalizedPath === child.href) : false
  );

  const isActive = normalizedPath === item.href ||
    (item.children && item.children.some(child => normalizedPath === child.href));

  if (item.children) {
    return (
      <div className="gap-1">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            isActive
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          )}
        >
          <div className="flex items-center gap-3">
            <item.icon className="w-4 h-4" />
            <span>{item.title}</span>
          </div>
          <div >
            {isRtl ? (isExpanded ? '▼' : '◀') : (isExpanded ? '▼' : '▶')}
          </div>
        </button>

        {isExpanded && (
          <div className="ml-4 gap-1">
            {item.children.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                onClick={onItemClick}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  normalizedPath === child.href
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
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onItemClick}
      className={cn(
        "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
        normalizedPath === item.href
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-accent"
      )}
    >
      <div className="flex items-center gap-3">
        <item.icon className="w-4 h-4" />
        <span>{item.title}</span>
      </div>
      {unreadCount && unreadCount > 0 && (
        <Badge variant="destructive" className="text-xs">
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </Link>
  );
}